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
  gridColumn = '1 / 4',
  onChange,
  onSelect,
  onKeyDown,
  onPointerDown,
  onFocus,
  onBlur,
  inputMode,
  maxLength,
  renderSuggestion,
  inputRef,
  withToggle = false, // 👈 NUEVO PROP
}) {
  const [internalFocus, setInternalFocus] = useState(false);

  const uniqueSuggestions = suggestions.filter(
    (s, i, arr) =>
      i === arr.findIndex((t) => (t._id ? t._id === s._id : t === s))
  );

  return (
    <div
      className="autocomplete-wrapper"
      style={{ gridColumn, position: 'relative' }}
    >
      <label htmlFor={id} className={label?.className}>
        {label?.name || label}
      </label>

      <div className="autocomplete-input-wrapper">
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
            setTimeout(() => setInternalFocus(false), 150);
            onBlur?.(e);
          }}
          autoComplete="off"
          inputMode={inputMode}
          maxLength={maxLength}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-expanded={showDropdown}
          className="autocomplete-input"
          ref={inputRef}
        />

        {/* 🔽 Botón con la flecha */}
        {withToggle && (
          <button
            type="button"
            className={`autocomplete-toggle ${showDropdown ? 'open' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault(); // evita blur del input
              if (showDropdown) {
                onBlur?.(e); // cerrar
              } else {
                onFocus?.(e); // abrir
              }
            }}
          >
            <img src="/dropdown-arrow.svg" alt="abrir opciones" />
          </button>
        )}
      </div>

      {showDropdown && uniqueSuggestions.length > 0 && internalFocus && (
        <ul id={`${id}-listbox`} role="listbox" className="autocomplete-list">
          {uniqueSuggestions.map((s, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                key={s._id || `${id}-${index}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect?.(s);
                }}
                className={`autocomplete-item ${isActive ? 'active' : ''}`}
              >
                {renderSuggestion ? (
                  renderSuggestion(s)
                ) : (
                  <span>{s.label || String(s)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
