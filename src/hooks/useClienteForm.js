import { useEffect, useRef, useState } from 'react';

export function useClienteForm({
  clienteInicial,
  handleChangeOrden,
  fetchClienteById,
  resetClienteId,
  clientes,
  fieldOrder = [],
}) {
  const [dniBusqueda, setDniBusqueda] = useState(clienteInicial?.dni || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentClients, setRecentClients] = useState([]);
  const [cacheClientes, setCacheClientes] = useState([]);
  const [manualClose, setManualClose] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [locked, setLocked] = useState(Boolean(clienteInicial?._id));

  // 🔹 NUEVO estado para email
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [activeEmailIndex, setActiveEmailIndex] = useState(-1);
  const [emailFetched, setEmailFetched] = useState(false); // 👈 evitar múltiples fetch

  const userInitiatedRef = useRef(false);
  const fieldRefs = useRef({});
  const baseUrl = import.meta.env.VITE_API_URL;

  // ✅ mover foco al siguiente campo usando fieldOrder dinámico
  const focusNextField = (currentName) => {
    const index = fieldOrder.indexOf(currentName);
    if (index >= 0 && index < fieldOrder.length - 1) {
      const nextName = fieldOrder[index + 1];
      const nextField = fieldRefs.current[nextName];
      if (nextField) {
        nextField.focus();
      }
    }
  };

  // cache de API
  useEffect(() => {
    if (clientes?.length > 0) {
      setCacheClientes(clientes);
    }
  }, [clientes]);

  // historial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentClients');
    if (stored) {
      try {
        setRecentClients(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // 🔹 Lógica del dropdown para DNI (igual que antes)
  useEffect(() => {
    if (manualClose) return;
    const term = dniBusqueda?.trim();

    if (!term || term.length === 0) {
      if (!userInitiatedRef.current && recentClients.length > 0) {
        setSuggestions([]);
        setShowDropdown(false);
      } else if (userInitiatedRef.current && recentClients.length > 0) {
        setSuggestions(recentClients);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } else if (term.length >= 4) {
      setSuggestions(clientes);
      setShowDropdown((clientes?.length || 0) > 0);
    } else if (term.length > 0 && term.length < 4) {
      const combined = [...(cacheClientes || []), ...(recentClients || [])];
      const filtered = combined.filter((c) => c.dni && c.dni.startsWith(term));
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    setActiveIndex(-1);
  }, [dniBusqueda, clientes, recentClients, cacheClientes, manualClose]);

  // ✅ handler DNI
  const handleDniChange = (e) => {
    let nuevoDni = e.target.value.replace(/\D/g, '');
    if (nuevoDni.length > 8) nuevoDni = nuevoDni.slice(0, 8);

    if (clienteInicial.dni !== nuevoDni) {
      resetClienteId();
      setLocked(false);
      handleChangeOrden('cliente', {
        _id: undefined,
        dni: nuevoDni,
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
      });
    } else {
      handleChangeOrden('cliente', { ...clienteInicial, dni: nuevoDni });
    }

    setDniBusqueda(nuevoDni);
    setManualClose(false);
  };

  const handleDniPointerDown = () => {
    userInitiatedRef.current = true;
    setIsFirstFocus(false);
    setManualClose(false);
  };

  const handleDniFocus = () => {
    if (isFirstFocus && !userInitiatedRef.current) {
      setIsFirstFocus(false);
      return;
    }
    userInitiatedRef.current = false;

    if (dniBusqueda.trim().length === 0 && recentClients.length > 0) {
      setSuggestions(recentClients);
      setShowDropdown(true);
    } else if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleDniBlur = () => {
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const saveRecentClient = (c) => {
    let updated = [
      { ...c, _source: 'recent' },
      ...recentClients.filter((rc) => rc.dni !== c.dni),
    ];
    if (updated.length > 10) updated = updated.slice(0, 10);
    setRecentClients(updated);
    localStorage.setItem('recentClients', JSON.stringify(updated));
  };

  const handleSelectCliente = async (c) => {
    try {
      const fullCliente = await fetchClienteById(c._id);
      const clienteFinal = {
        _id: fullCliente?._id || c._id,
        dni: fullCliente?.dni || c.dni,
        nombres: fullCliente?.nombres || '',
        apellidos: fullCliente?.apellidos || '',
        telefono: fullCliente?.telefono || '',
        email: fullCliente?.email || '',
        direccion: fullCliente?.direccion || '',
      };

      handleChangeOrden('cliente', clienteFinal);
      saveRecentClient(clienteFinal);

      setShowDropdown(false);
      setActiveIndex(-1);
      setDniBusqueda(clienteFinal.dni);
      setManualClose(true);
      setLocked(true);
    } catch (err) {
      console.error('[handleSelectCliente] error fetching cliente:', err);
    }
  };

  const handleKeyDownDni = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && dniBusqueda.length === 8) {
        e.preventDefault();
        focusNextField('dni');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectCliente(suggestions[activeIndex]);
      } else if (dniBusqueda.length === 8) {
        focusNextField('dni');
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const MANUAL_OPTION = '__manual__';

  // 🔹 función común de fetch
  const fetchEmailSuggestions = async () => {
    if (emailFetched || !clienteInicial?.nombres || !clienteInicial?.apellidos)
      return;
    try {
      const res = await fetch(`${baseUrl}/api/clientes/generar-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: clienteInicial.nombres,
          apellidos: clienteInicial.apellidos,
        }),
      });
      const data = await res.json();
      setEmailSuggestions([...(data.details || []), MANUAL_OPTION]);
      setEmailFetched(true);
    } catch (err) {
      console.error('[fetchEmailSuggestions] error fetching emails:', err);
      setEmailSuggestions([]);
    }
  };

  const handleEmailFocus = async () => {
    await fetchEmailSuggestions();
    setShowEmailDropdown(true);
    setActiveEmailIndex(-1);
  };

  const toggleEmailDropdown = async () => {
    await fetchEmailSuggestions();
    setShowEmailDropdown((prev) => !prev);
  };

  const handleEmailSelect = (value) => {
    if (value === MANUAL_OPTION) {
      handleChangeOrden('cliente', { ...clienteInicial, email: '' });
    } else {
      handleChangeOrden('cliente', { ...clienteInicial, email: value });
    }
    setShowEmailDropdown(false);
  };

  const handleEmailBlur = () => {
    setTimeout(() => setShowEmailDropdown(false), 150);
  };

  const handleKeyDownEmail = (e) => {
    if (!showEmailDropdown || emailSuggestions.length === 0) {
      // Si no hay dropdown, permitir salto manual con Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        focusNextField('email'); // 👈 avanza al siguiente campo
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveEmailIndex((prev) => (prev + 1) % emailSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveEmailIndex((prev) =>
        prev <= 0 ? emailSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeEmailIndex >= 0) {
        handleEmailSelect(emailSuggestions[activeEmailIndex]);
        focusNextField('email'); // 👈 después de elegir, pasamos al siguiente
      }
    } else if (e.key === 'Escape') {
      setShowEmailDropdown(false);
      setActiveEmailIndex(-1);
    }
  };

  const handleGenericKeyDown = (fieldName) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextField(fieldName);
    }
  };

  // ⚡ Genera un proxy dinámico de handlers genéricos
  const genericHandlers = new Proxy(
    {},
    {
      get: (_, fieldName) => handleGenericKeyDown(fieldName),
    }
  );

  return {
    dniBusqueda,
    showDropdown,
    suggestions,
    activeIndex,
    locked,
    fieldRefs,
    handlers: {
      //regular input
      generic: genericHandlers ?? {}, // 👈 fallback vacío por si acaso
      // dni...
      handleDniChange,
      handleSelectCliente,
      handleKeyDownDni,
      handleDniPointerDown,
      handleDniFocus,
      handleDniBlur,

      // email...
      handleEmailFocus,
      handleEmailSelect,
      handleKeyDownEmail,
      handleEmailBlur,
      toggleEmailDropdown, // 👈 agregado
    },
    emailState: {
      emailSuggestions,
      showEmailDropdown,
      activeEmailIndex,
    },
  };
}
