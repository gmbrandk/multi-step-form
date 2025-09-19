// src/components/form/AutocompleteField.jsx
import { useState } from 'react';

export function AutocompleteField({
  id,
  label,
  placeholder,
  value,
  suggestions = [],
  showDropdown = false,
  activeIndex = -1,
  disabled = false,
  gridColumn = '1 / 4', // 🔹 se puede sobreescribir desde SchemaForm
  onChange,
  onSelect,
  onKeyDown,
  onPointerDown,
  onFocus,
  onBlur,
}) {
  const [internalFocus, setInternalFocus] = useState(false);

  // 🔹 Debug rápido
  //   console.log('Render AutocompleteField', {
  //     value,
  //     suggestionsLength: suggestions.length,
  //     showDropdown,
  //     internalFocus,
  //   });

  // Función para limpiar duplicados (según _id y dni)
  const uniqueSuggestions = suggestions.filter(
    (s, i, arr) =>
      i === arr.findIndex((t) => t.dni === s.dni && t._id === s._id)
  );

  return (
    <div
      className="autocomplete-wrapper"
      style={{ gridColumn, position: 'relative' }}
    >
      <label htmlFor={id} className={label?.className}>
        {label?.name || label}
      </label>

      <input
        id={id}
        name={id}
        type="text"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onFocus={(e) => {
          setInternalFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          // 🔹 diferir el blur para permitir seleccionar con mouse
          setTimeout(() => setInternalFocus(false), 150);
          onBlur?.(e);
        }}
        autoComplete="off"
        inputMode="numeric"
        maxLength={8}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        aria-expanded={showDropdown}
        className="autocomplete-input"
      />

      {showDropdown && suggestions.length > 0 && internalFocus && (
        <ul id={`${id}-listbox`} role="listbox" className="autocomplete-list">
          {uniqueSuggestions.map((s, index) => {
            const itemClass = `
      autocomplete-item
      ${activeIndex === index ? 'active' : ''}
      ${s._source === 'recent' ? 'recent' : 'from-api'}
    `;

            return (
              <li
                key={`${s._id || 'local'}-${s.dni}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(e) => {
                  e.preventDefault(); // evita blur prematuro
                  onSelect?.(s);
                }}
                className={itemClass}
              >
                <span className="dni">{s.dni}</span>
                <span className="nombre">
                  {s.nombres} {s.apellidos}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
