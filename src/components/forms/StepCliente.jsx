import { useEffect, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useBuscarClientes } from '../../hooks/useBuscarClientes';
import { SchemaForm } from './SchemaForm';

export function StepCliente() {
  const { orden, handleChangeOrden } = useOrdenServicioContext();
  const cliente = orden.cliente || {};
  const { clientes } = useBuscarClientes(cliente.dni);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentClients, setRecentClients] = useState([]);

  // cargar historial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentClients');
    if (stored) setRecentClients(JSON.parse(stored));
  }, []);

  const saveRecentClient = (c) => {
    let updated = [
      { ...c, _source: 'recent' }, // 👈 marcamos origen
      ...recentClients.filter((rc) => rc.dni !== c.dni),
    ];

    if (updated.length > 10) updated = updated.slice(0, 10); // máximo 10

    setRecentClients(updated);
    localStorage.setItem('recentClients', JSON.stringify(updated));
  };

  const handleSelectCliente = (c) => {
    handleChangeOrden('cliente', {
      dni: c.dni,
      nombres: c.nombres,
      apellidos: c.apellidos,
      telefono: c.telefono,
      email: c.email,
      direccion: c.direccion ?? '',
    });

    saveRecentClient(c); // 👈 guardar en historial
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleInputDNI = (value) => {
    if (value.length >= 4) {
      // 👇 mostrar resultados de la API
      setSuggestions(clientes);
      setShowDropdown(true);
    } else if (value.length === 0 && recentClients.length > 0) {
      // 👇 input vacío → mostrar historial
      setSuggestions(recentClients);
      setShowDropdown(true);
    } else {
      // 👇 menos de 4 chars y no vacío → ocultar
      setSuggestions([]);
      setShowDropdown(false);
    }

    setActiveIndex(-1); // siempre reset cursor
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

  const handleFocus = () => {
    if (cliente.dni?.length >= 4 && clientes.length > 0) {
      setSuggestions(clientes);
      setShowDropdown(true);
    } else if (recentClients.length > 0) {
      setSuggestions(recentClients);
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const clienteFields = [
    {
      name: 'dni',
      type: 'autocomplete',
      label: { name: 'DNI', className: 'sr-only' },
      placeholder: 'Ej: 45591954',
      gridColumn: '1 / 4',
      suggestions,
      onInput: handleInputDNI,
      onSelect: handleSelectCliente,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus, // 👈 mostrar historial
      onBlur: handleBlur, // 👈 lo pasamos al input
      activeIndex,
      showDropdown,
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
          if (field === 'dni') setShowDropdown(true);
        }}
        fields={clienteFields}
        gridTemplateColumns="repeat(3, 1fr)"
        showDescriptions={false}
      />
    </div>
  );
}
