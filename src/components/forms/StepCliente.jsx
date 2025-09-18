import { useEffect, useRef, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useBuscarClientes } from '../../hooks/useBuscarClientes';
import { SchemaForm } from './SchemaForm';

export function StepCliente() {
  const { orden, handleChangeOrden, resetClienteId } =
    useOrdenServicioContext();
  const cliente = orden.cliente || {};
  const [dniBusqueda, setDniBusqueda] = useState(cliente.dni || '');
  const { clientes } = useBuscarClientes(dniBusqueda);

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentClients, setRecentClients] = useState([]);
  const [cacheClientes, setCacheClientes] = useState([]);
  const [manualClose, setManualClose] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);

  const userInitiatedRef = useRef(false);

  // ✅ Reset inicial para evitar dropdown abierto al volver con "Prev"
  useEffect(() => {
    setShowDropdown(false);
    setActiveIndex(-1);
    setManualClose(false);
    setIsFirstFocus(true);
  }, []);

  // guarda en cache lo que viene de API
  useEffect(() => {
    if (clientes.length > 0) {
      setCacheClientes(clientes);
    }
  }, [clientes]);

  // cargar historial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentClients');
    if (stored) {
      setRecentClients(JSON.parse(stored));
    }
  }, []);

  // sincroniza sugerencias (búsqueda progresiva + regresiva + historial en vacío)
  useEffect(() => {
    if (manualClose) return; // ⛔️ no reabrir automáticamente después de un select

    const term = dniBusqueda?.trim();

    if (term.length >= 4 && term.length < 8) {
      // búsqueda en API progresiva
      setSuggestions(clientes);
      setShowDropdown(clientes.length > 0);
    } else if (term.length > 0 && term.length < 4) {
      // búsqueda regresiva en cache + recientes
      const combined = [...cacheClientes, ...recentClients];
      const filtered = combined.filter((c) => c.dni.startsWith(term));
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else if (term.length === 0 && recentClients.length > 0) {
      if (!userInitiatedRef.current) {
        // ⛔️ Evitar que se muestre automáticamente al cargar la página o reiniciar el step
        setSuggestions([]);
        setShowDropdown(false);
      } else {
        // ✅ Mostrar historial solo si el usuario interactuó
        setSuggestions(recentClients);
        setShowDropdown(true);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    setActiveIndex(-1);
  }, [dniBusqueda, clientes, recentClients, cacheClientes, manualClose]);

  // ✅ Nuevo handler centralizado para DNI
  const handleDniChange = (e) => {
    let nuevoDni = e.target.value.replace(/\D/g, ''); // solo dígitos
    if (nuevoDni.length > 8) nuevoDni = nuevoDni.slice(0, 8); // máx. 8

    if (cliente.dni !== nuevoDni) resetClienteId();

    handleChangeOrden('cliente', { ...cliente, dni: nuevoDni });
    setDniBusqueda(nuevoDni);
    setManualClose(false); // habilita reapertura al escribir
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

  const handleSelectCliente = (c) => {
    handleChangeOrden('cliente', {
      _id: c._id,
      dni: c.dni,
      nombres: c.nombres,
      apellidos: c.apellidos,
      telefono: c.telefono,
      email: c.email,
      direccion: c.direccion ?? '',
    });

    saveRecentClient(c);

    setShowDropdown(false);
    setActiveIndex(-1);
    setDniBusqueda(c.dni);
    setManualClose(true); // ⛔️ evita reapertura inmediata
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
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
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

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
      onChange: handleDniChange,
      onSelect: handleSelectCliente,
      onKeyDown: handleKeyDown,
      onPointerDown: handleDniPointerDown,
      onFocus: () => {
        if (isFirstFocus && !userInitiatedRef.current) {
          setIsFirstFocus(false);
          return;
        }
        userInitiatedRef.current = false;

        if (dniBusqueda.trim().length === 0 && recentClients.length > 0) {
          // ✅ si está vacío, mostrar clientes recientes al enfocar
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
    },
    {
      name: 'nombres',
      type: 'text',
      label: { name: 'Nombres', className: 'sr-only' },
      placeholder: 'Ej: Adriana Josefina',
      gridColumn: '1 / 4',
    },
    {
      name: 'apellidos',
      type: 'text',
      label: { name: 'Apellidos', className: 'sr-only' },
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
    },
    {
      name: 'telefono',
      type: 'text',
      label: { name: 'Teléfono', className: 'sr-only' },
      placeholder: 'Ej: 913458768',
      gridColumn: '1 / 4',
    },
    {
      name: 'email',
      type: 'text',
      label: { name: 'Email', className: 'sr-only' },
      placeholder: 'Ej: ejemplo@correo.com',
      gridColumn: '1 / 4',
    },
    {
      name: 'direccion',
      type: 'text',
      label: { name: 'Dirección', className: 'sr-only' },
      placeholder: 'Ej: Av. Siempre Viva 742',
      gridColumn: '1 / 4',
    },
  ];

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
