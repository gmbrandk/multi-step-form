// hooks/useClienteForm.js
import { useEffect, useRef, useState } from 'react';

export function useClienteForm({
  clienteInicial,
  handleChangeOrden,
  fetchClienteById,
  resetClienteId,
  clientes,
  fieldOrder = [], // 👈 ahora viene del schema
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

  const userInitiatedRef = useRef(false);
  const fieldRefs = useRef({});

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

  // 🔹 Lógica del dropdown
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

  // ✅ handler DNI (resetea todos los campos si cambia)
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

  // ✅ lookup + cerrar dropdown
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

  // ✅ manejo de teclado (incluye salto a siguiente campo)
  const handleKeyDownDni = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && dniBusqueda.length === 8) {
        e.preventDefault();
        focusNextField('dni'); // 👈 ahora funciona con fieldOrder dinámico
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

  return {
    dniBusqueda,
    showDropdown,
    suggestions,
    activeIndex,
    locked,
    fieldRefs,
    handlers: {
      handleDniChange,
      handleSelectCliente,
      handleKeyDownDni,
      handleDniPointerDown,
      handleDniFocus,
      handleDniBlur,
    },
  };
}
