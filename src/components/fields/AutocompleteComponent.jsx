export function AutocompleteComponent({
  id,
  label,
  placeholder,
  value,
  disabled,
  gridColumn,
  withToggle,
  shouldShowDropdown,
  uniqueSuggestions,
  activeIndex,
  onChange,
  onSelect,
  onFocus,
  onBlur,
  onKeyDown,
  onToggle,
  renderSuggestion,
  inputRef,
}) {
  const displayValue =
    typeof value === 'object' ? value.label || value.codigo || '' : value || '';

  return (
    <div
      className="autocomplete-wrapper"
      style={{ gridColumn, position: 'relative' }}
    >
      {label && (
        <label htmlFor={id} className={label?.className}>
          {label?.name || label}
        </label>
      )}

      <div className="autocomplete-input-wrapper">
        <input
          id={id}
          name={id}
          type="text"
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          className="autocomplete-input"
          ref={inputRef}
        />

        {withToggle && (
          <button
            type="button"
            className={`autocomplete-toggle ${
              shouldShowDropdown ? 'open' : ''
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              onToggle?.();
            }}
          >
            <img src="/dropdown-arrow.svg" alt="abrir opciones" />
          </button>
        )}
      </div>

      {shouldShowDropdown && (
        <ul id={`${id}-listbox`} role="listbox" className="autocomplete-list">
          {uniqueSuggestions.map((s, index) => (
            <li
              key={s._id || `${id}-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(s, e);
              }}
              className={`autocomplete-item ${
                activeIndex === index ? 'active' : ''
              }`}
            >
              {renderSuggestion ? (
                renderSuggestion(s)
              ) : (
                <span>{s.label || String(s)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
