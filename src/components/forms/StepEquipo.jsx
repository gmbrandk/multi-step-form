import { useEffect, useRef, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useBuscarEquipos } from '../../hooks/useBuscarEquipos';
import { SchemaForm } from './SchemaForm';

export function StepEquipo() {
  const { orden, handleChangeOrden } = useOrdenServicioContext();
  const equipo = orden.equipo || {};
  const [nroSerieBusqueda, setNroSerieBusqueda] = useState(
    equipo.nroSerie || ''
  );

  const { equipos, fetchEquipoById } = useBuscarEquipos(nroSerieBusqueda);

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentEquipos, setRecentEquipos] = useState([]);
  const [cacheEquipos, setCacheEquipos] = useState([]);
  const [manualClose, setManualClose] = useState(false);

  const userInitiatedRef = useRef(false);

  // cache desde API
  useEffect(() => {
    if (equipos.length > 0) setCacheEquipos(equipos);
  }, [equipos]);

  // historial desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentEquipos');
    if (stored) setRecentEquipos(JSON.parse(stored));
  }, []);

  // sincroniza sugerencias
  useEffect(() => {
    if (manualClose) return;
    const term = nroSerieBusqueda.trim();

    if (term.length >= 4) {
      setSuggestions(equipos);
      setShowDropdown(equipos.length > 0);
    } else if (term.length > 0) {
      const combined = [...cacheEquipos, ...recentEquipos];
      const filtered = combined.filter((e) => e.nroSerie.startsWith(term));
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
    setActiveIndex(-1);
  }, [nroSerieBusqueda, equipos, cacheEquipos, recentEquipos, manualClose]);

  // 🔹 si el nroSerie cambia y no coincide con el equipo seleccionado → limpiar _id
  useEffect(() => {
    if (
      nroSerieBusqueda &&
      equipo.nroSerie &&
      nroSerieBusqueda.toUpperCase() !== equipo.nroSerie.toUpperCase()
    ) {
      // si escribo algo distinto → liberar campos
      handleChangeOrden('equipo', { ...equipo, _id: null });
    }
  }, [nroSerieBusqueda]);

  const handleNroSerieChange = (e) => {
    const nuevo = e.target.value.toUpperCase();
    setNroSerieBusqueda(nuevo);
    handleChangeOrden('equipo', { ...equipo, nroSerie: nuevo, _id: null });
    setManualClose(false);
  };

  const saveRecentEquipo = (eq) => {
    let updated = [
      { ...eq, _source: 'recent' },
      ...recentEquipos.filter((r) => r.nroSerie !== eq.nroSerie),
    ];
    if (updated.length > 10) updated = updated.slice(0, 10);
    setRecentEquipos(updated);
    localStorage.setItem('recentEquipos', JSON.stringify(updated));
  };

  const handleSelectEquipo = async (eq) => {
    // 1️⃣ Lookup por ID para traer todos los campos reales
    const fullEquipo = await fetchEquipoById(eq._id);

    const finalEquipo = fullEquipo || eq;

    // 2️⃣ Actualizar orden con los datos completos
    handleChangeOrden('equipo', {
      _id: finalEquipo._id,
      nroSerie: finalEquipo.nroSerie,
      tipo: finalEquipo.tipo,
      marca: finalEquipo.marca,
      modelo: finalEquipo.modelo,
      sku: finalEquipo.sku,
      macAddress: finalEquipo.macAddress,
      imei: finalEquipo.imei,
      estado: finalEquipo.estado,
    });

    // 3️⃣ Guardar en recientes y UI
    saveRecentEquipo(finalEquipo);
    setShowDropdown(false);
    setActiveIndex(-1);
    setNroSerieBusqueda(finalEquipo.nroSerie);
    setManualClose(true);
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
        handleSelectEquipo(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const isEquipoExistente = Boolean(equipo?._id);

  const equipoFields = [
    {
      name: 'nroSerie',
      type: 'autocomplete',
      label: { name: 'Nro. Serie', className: 'sr-only' },
      placeholder: 'Ej: 3BO52134Q',
      gridColumn: '1 / 4',
      suggestions,
      showDropdown,
      activeIndex,
      onChange: handleNroSerieChange,
      onSelect: handleSelectEquipo,
      onKeyDown: handleKeyDown,
      onFocus: () => {
        if (nroSerieBusqueda.trim().length === 0 && recentEquipos.length > 0) {
          setSuggestions(recentEquipos);
          setShowDropdown(true);
        } else if (suggestions.length > 0) {
          setShowDropdown(true);
        }
      },
      onBlur: () => {
        setShowDropdown(false);
        setActiveIndex(-1);
      },
      renderSuggestion: (eq) => (
        <div className="autocomplete-item">
          <span className="left-span">{eq.nroSerie}</span>
          <span className="right-span">{eq.marca}</span>
          <span className="right-span">{eq.modelo}</span>
        </div>
      ),
      disabled: false, // 🔹 este siempre habilitado
    },
    {
      name: 'tipo',
      type: 'text',
      placeholder: 'Ej: Laptop',
      gridColumn: '1 / 4',
      disabled: isEquipoExistente,
    },
    {
      name: 'marca',
      type: 'text',
      placeholder: 'Ej: Toshiba',
      gridColumn: '1 / 4',
      disabled: isEquipoExistente,
    },
    {
      name: 'modelo',
      type: 'text',
      placeholder: 'Ej: Satellite L45',
      gridColumn: '1 / 4',
      disabled: isEquipoExistente,
    },
    {
      name: 'sku',
      type: 'text',
      placeholder: 'Ej: L45B4205FL',
      gridColumn: '1 / 4',
      disabled: isEquipoExistente,
    },
    {
      name: 'macAddress',
      type: 'text',
      placeholder: 'Ej: FA:KE:28:08:25:03',
      gridColumn: '1 / 4',
      disabled: isEquipoExistente,
    },
    {
      name: 'especificaciones',
      type: 'checkbox',
      className: 'fs-subtitle inline',
      label: { name: 'Agregar especificaciones de equipo' },
      gridColumn: '1 / 4',
      defaultValue: false,
      disabled: isEquipoExistente,
    },
  ];

  return (
    <SchemaForm
      values={equipo}
      onChange={(field, value) => {
        handleChangeOrden('equipo', { ...equipo, [field]: value });
      }}
      fields={equipoFields}
      gridTemplateColumns="repeat(3, 1fr)"
      showDescriptions={false}
    />
  );
}
