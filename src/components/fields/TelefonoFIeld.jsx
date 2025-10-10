// components/TelefonoField.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../InputBase';

export function TelefonoField({
  value,
  onChange,
  disabled = false, // usamos la prop estándar, no "locked"
  paisSeleccionado,
  prefijosTelefonicos = [],
  handleSelectPais,
  navHandlers,
  fieldRefs,
  gridColumn = '1 / 4',
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  const handleTelefonoChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    onChange(raw);
  };

  useEffect(() => {
    if (fieldRefs?.current) {
      fieldRefs.current['telefono'] = inputRef.current;
    }
  }, [fieldRefs]);

  return (
    <div className="telefono-wrapper" style={{ gridColumn }}>
      <div className="telefono-container">
        {/* Prefijo país */}
        <div
          className={`telefono-prefix ${showDropdown ? 'open' : ''}`}
          onClick={() => !disabled && setShowDropdown((v) => !v)}
        >
          <img src={paisSeleccionado.bandera} alt={paisSeleccionado.pais} />
          <span>{paisSeleccionado.codigo}</span>
        </div>

        {/* Nuestro Input reutilizable */}
        <Input
          name="telefono"
          placeholder="Ej: 913458768"
          value={value || ''}
          onChange={handleTelefonoChange}
          onKeyDown={navHandlers?.generic?.telefono}
          disabled={disabled}
          ref={inputRef}
          className="telefono-input"
        />
      </div>

      {showDropdown && (
        <div className="telefono-dropdown">
          {prefijosTelefonicos.map((p, i) => (
            <div
              key={`${p.iso}-${i}`}
              className="telefono-item"
              onClick={() => {
                handleSelectPais(p);
                setShowDropdown(false);
              }}
            >
              <img src={p.bandera} alt={p.pais} />
              <span className="telefono-pais">{p.pais}</span>
              <span className="telefono-codigo">{p.codigo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
