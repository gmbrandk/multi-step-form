// components/TelefonoField.jsx
import { useEffect, useRef } from 'react';
import { Input } from '../InputBase';
import { useDropdown } from './useDropdown';

export function TelefonoField({
  value,
  onChange,
  locked,
  paisSeleccionado,
  prefijosTelefonicos = [],
  handleSelectPais,
  navHandlers,
  fieldRefs,
  maxLength,
  gridColumn = '1 / 4',
}) {
  const inputRef = useRef(null);

  const { isOpen, toggle, handleSelect, dropdownRef } = useDropdown({
    onSelect: (p) => handleSelectPais(p),
  });

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
    <div
      className={`telefono-wrapper `}
      style={{ gridColumn }}
      ref={dropdownRef}
    >
      <div className={`telefono-container ${locked ? 'disabled' : ''}`}>
        {/* Prefijo país */}
        <div
          className={`telefono-prefix ${isOpen ? 'open' : ''}  ${
            locked ? 'disabled' : ''
          } `}
          onClick={() => !locked && toggle()}
        >
          <img src={paisSeleccionado.bandera} alt={paisSeleccionado.pais} />
        </div>

        <Input
          name="telefono"
          placeholder="Ej: 913458768"
          value={value || ''}
          onChange={handleTelefonoChange}
          onKeyDown={navHandlers?.generic?.telefono}
          disabled={locked}
          maxLength={maxLength}
          ref={inputRef}
          classes={{
            input: 'telefono-input',
          }}
          style={{
            border: 'none',
          }}
        />
      </div>

      {isOpen && (
        <div className="telefono-dropdown">
          {prefijosTelefonicos.map((p, i) => (
            <div
              key={`${p.iso}-${i}`}
              className="telefono-item"
              onClick={(e) => handleSelect(p, e)}
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
