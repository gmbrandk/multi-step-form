// StepCliente.jsx
import { useEffect, useRef, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useBuscarClientes } from '../../hooks/useBuscarClientes';
import { SchemaForm } from './SchemaForm';

export function StepCliente() {
  const { orden, handleChangeOrden, resetClienteId } =
    useOrdenServicioContext();
  const cliente = orden.cliente || {};
  const [dniBusqueda, setDniBusqueda] = useState(cliente.dni || '');
  const { clientes, fetchClienteById, isNew } = useBuscarClientes(dniBusqueda); // 👈 ahora trae isNew

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentClients, setRecentClients] = useState([]);
  const [cacheClientes, setCacheClientes] = useState([]);
  const [manualClose, setManualClose] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [locked, setLocked] = useState(Boolean(cliente._id));

  const userInitiatedRef = useRef(false);
  const fieldRefs = useRef([]);

  // función para saltar al siguiente input
  const focusNextField = (idx) => {
    console.log(
      `[focusNextField] desde idx=${idx}, fieldRefs.length=${fieldRefs.current.length}`
    );
    const next = fieldRefs.current[idx + 1];
    if (next) {
      console.log(`[focusNextField] ✅ enfocando idx=${idx + 1}`, next);
      next.focus();
    } else {
      console.log(`[focusNextField] ⚠️ no hay siguiente campo`);
    }
  };

  // ✅ Reset inicial
  useEffect(() => {
    console.log('[useEffect:init] inicializando StepCliente');
    setShowDropdown(false);
    setActiveIndex(-1);
    setManualClose(false);
    setIsFirstFocus(true);
    fieldRefs.current = [];
  }, []);

  // cache de API
  useEffect(() => {
    if (clientes?.length > 0) {
      console.log(
        `[useEffect:cache] guardando ${clientes.length} clientes en cache`
      );
      setCacheClientes(clientes);
    }
  }, [clientes]);

  // historial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentClients');
    if (stored) {
      try {
        setRecentClients(JSON.parse(stored));
        console.log(
          '[useEffect:recent] cargados recentClients desde localStorage'
        );
      } catch (err) {
        console.warn('[useEffect:recent] error parseando recentClients', err);
      }
    }
  }, []);

  // 🔹 Sincroniza sugerencias según lo digitado en DNI
  useEffect(() => {
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

      if (isNew && term.length === 8) {
        console.log('[Dropdown] DNI nuevo detectado → desbloqueo campos');
        handleChangeOrden('cliente', {
          _id: undefined,
          dni: term,
          nombres: '',
          apellidos: '',
          telefono: '',
          email: '',
          direccion: '',
        });
        setLocked(false);
      }
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
  }, [dniBusqueda, clientes, recentClients, cacheClientes, manualClose, isNew]);

  // 🔍 Debug temporal para verificar isNew
  useEffect(() => {
    console.log(
      '[Debug:isNew] dniBusqueda=',
      dniBusqueda,
      'clientes=',
      clientes,
      'isNew=',
      isNew
    );
  }, [dniBusqueda, clientes, isNew]);

  // handler DNI
  const handleDniChange = (e) => {
    let nuevoDni = e.target.value.replace(/\D/g, '');
    if (nuevoDni.length > 8) nuevoDni = nuevoDni.slice(0, 8);

    if (cliente.dni !== nuevoDni) {
      resetClienteId();
      setLocked(false);
      handleChangeOrden('cliente', {
        ...cliente,
        _id: undefined,
        dni: nuevoDni,
      });
    } else {
      handleChangeOrden('cliente', { ...cliente, dni: nuevoDni });
    }

    setDniBusqueda(nuevoDni);
    setManualClose(false);
  };

  const handleDniPointerDown = () => {
    userInitiatedRef.current = true;
    setIsFirstFocus(false);
    setManualClose(false);
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

  // 🔹 Lookup de cliente por ID
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

      setTimeout(() => {
        focusNextField(0);
      }, 0);
    } catch (err) {
      console.error('[handleSelectCliente] error fetching cliente:', err);
    }
  };

  const handleKeyDownDni = (e) => {
    console.log(
      '[DNI KeyDown] key=',
      e.key,
      'activeIndex=',
      activeIndex,
      'showDropdown=',
      showDropdown,
      'isNew=',
      isNew
    );

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
      } else if (
        dniBusqueda.length === 8 &&
        !isNew &&
        suggestions.length === 1
      ) {
        handleSelectCliente(suggestions[0]);
      } else if (dniBusqueda.length === 8 && isNew) {
        console.log('[DNI KeyDown] DNI nuevo → salto a siguiente campo');
        setTimeout(() => focusNextField(0), 0);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  // definición campos
  const clienteFields = [
    {
      name: 'dni',
      type: 'autocomplete',
      label: { name: 'DNI', className: 'sr-only' },
      placeholder: 'Ej: 45591954',
      gridColumn: '1 / 4',
      suggestions,
      showDropdown,
      activeIndex,
      isNew, // 👈 pasamos el flag al field
      onChange: handleDniChange,
      onSelect: handleSelectCliente,
      onKeyDown: handleKeyDownDni,
      onPointerDown: handleDniPointerDown,
      onFocus: () => {
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
      },
      onBlur: () => {
        setShowDropdown(false);
        setActiveIndex(-1);
      },
      maxLength: 8,
      inputMode: 'numeric',
      disabled: false,
      inputRef: fieldRefs,
      renderSuggestion: (cliente) => (
        <div className="autocomplete-item">
          <span className="left-span">{cliente.dni}</span>
          <span className="right-span">
            {cliente.nombres} {cliente.apellidos}
          </span>
        </div>
      ),
    },
    {
      name: 'nombres',
      type: 'text',
      label: { name: 'Nombres', className: 'sr-only' },
      placeholder: 'Ej: Adriana Josefina',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: fieldRefs,
    },
    {
      name: 'apellidos',
      type: 'text',
      label: { name: 'Apellidos', className: 'sr-only' },
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: fieldRefs,
    },
    {
      name: 'telefono',
      type: 'text',
      label: { name: 'Teléfono', className: 'sr-only' },
      placeholder: 'Ej: 913458768',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: fieldRefs,
    },
    {
      name: 'email',
      type: 'text',
      label: { name: 'Email', className: 'sr-only' },
      placeholder: 'Ej: ejemplo@correo.com',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: fieldRefs,
    },
    {
      name: 'direccion',
      type: 'text',
      label: { name: 'Dirección', className: 'sr-only' },
      placeholder: 'Ej: Av. Siempre Viva 742',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: fieldRefs,
    },
  ];

  // asignar refs y redefinir keydown con salto inteligente
  clienteFields.forEach((field, idx) => {
    field.inputRef = (el) => {
      console.log(
        `[StepCliente][Refs] asignado idx=${idx} field="${field.name}" →`,
        el
      );
      fieldRefs.current[idx] = el;
    };

    const originalKeyDown = field.onKeyDown;
    field.onKeyDown = (e) => {
      if (originalKeyDown) originalKeyDown(e);

      if (e.key === 'Enter') {
        console.log(
          `[StepCliente][KeyDown] Enter en idx=${idx} field="${field.name}"`
        );

        if (field.type === 'autocomplete') {
          console.log(
            `[StepCliente][KeyDown] Enter en autocomplete → no salto (maneja AutocompleteField)`
          );
          return;
        }

        e.preventDefault();
        focusNextField(idx);
      }
    };
  });

  return (
    <div style={{ position: 'relative' }}>
      <SchemaForm
        values={cliente}
        onChange={(field, value) => {
          handleChangeOrden('cliente', { ...cliente, [field]: value });
        }}
        fields={clienteFields}
        gridTemplateColumns="repeat(3, 1fr)"
        showDescriptions={false}
      />
    </div>
  );
}
