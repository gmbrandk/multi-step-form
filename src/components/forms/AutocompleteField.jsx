import { useState } from 'react';

// AutocompleteField.jsx
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
  renderSuggestion, // 👈 nuevo
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
                key={s._id || `${id}-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect?.(s);
                }}
                className={itemClass}
              >
                {renderSuggestion ? (
                  renderSuggestion(s) // 👈 lo decide el padre
                ) : (
                  <span>{s.label || String(s)}</span> // 👈 fallback
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
