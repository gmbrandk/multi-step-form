export function SchemaForm({
  values = {},
  onChange,
  fields = [],
  gridTemplateColumns = 'repeat(3, 1fr)',
  showDescriptions = true,
  readOnly = false,
}) {
  if (!fields.length) return null;

  const resolveValue = (field, values) => {
    const v = values[field.name];
    const isEmpty = v === undefined || v === null || v === '';
    return isEmpty ? field.defaultValue ?? '' : v;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        columnGap: '8px',
      }}
    >
      {fields.map((field) => {
        const { name, type, label, className } = field;
        if (field.visibleWhen && !field.visibleWhen(values)) return null;

        const column =
          typeof field.gridColumn === 'function'
            ? field.gridColumn(values)
            : field.gridColumn;

        const value = resolveValue(field, values);

        // === Autocomplete ===
        if (type === 'autocomplete') {
          return (
            <div
              key={name}
              className="autocomplete-wrapper"
              style={{ gridColumn: column, position: 'relative' }}
            >
              <label htmlFor={name} className={label?.className}>
                {label?.name || label}
              </label>
              <input
                id={name}
                name={name}
                type="text"
                placeholder={field.placeholder}
                value={value}
                disabled={readOnly}
                onChange={(e) => {
                  onChange(name, e.target.value);
                  field.onChange?.(e);
                }}
                onKeyDown={field.onKeyDown}
                onPointerDown={field.onPointerDown}
                onFocus={field.onFocus}
                onBlur={field.onBlur}
                className="autocomplete-input"
                autoComplete="off"
              />

              {field.showDropdown && field.suggestions?.length > 0 && (
                <ul className="autocomplete-list">
                  {field.suggestions.map((s, index) => {
                    const itemClass = `autocomplete-item
                      ${field.activeIndex === index ? 'active' : ''}
                      ${s._source === 'recent' ? 'recent' : 'from-api'}`;

                    return (
                      <li
                        key={`${s._id || 'local'}-${s.dni}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          field.onSelect?.(s);
                          field.onBlur?.();
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

        // === Otros tipos de campo ===
        if (type === 'checkbox') {
          return (
            <div
              key={name}
              className={className}
              style={{
                gridColumn: column || '1 / -1',
                justifySelf: 'center',
                alignSelf: 'center',
              }}
            >
              <label htmlFor={name} className={label?.className}>
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  checked={!!value}
                  disabled={readOnly}
                  onChange={(e) => onChange(name, e.target.checked)}
                />
                <span>{label?.name || label}</span>
              </label>
              {showDescriptions && field.description && (
                <small>{field.description}</small>
              )}
            </div>
          );
        }

        if (type === 'select') {
          return (
            <div key={name} style={{ gridColumn: column }}>
              <label htmlFor={name} className={label?.className}>
                {label?.name || label}
              </label>
              <select
                id={name}
                name={name}
                value={value}
                disabled={readOnly}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%' }}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showDescriptions && field.description && (
                <small>{field.description}</small>
              )}
            </div>
          );
        }

        if (type === 'textarea') {
          return (
            <div key={name} style={{ gridColumn: column }}>
              <label htmlFor={name} className={label?.className}>
                {label?.name || label}
              </label>
              <textarea
                id={name}
                name={name}
                placeholder={field.placeholder}
                value={value}
                disabled={readOnly}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%', minHeight: '60px' }}
              />
              {showDescriptions && field.description && (
                <small>{field.description}</small>
              )}
            </div>
          );
        }

        if (type === 'output') {
          return (
            <div key={name} style={{ gridColumn: column }}>
              <label htmlFor={name} className={label?.className}>
                {label?.name || label}
              </label>
              <output
                id={name}
                name={name}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  background: '#eee',
                }}
              >
                {value}
              </output>
            </div>
          );
        }

        // === Input genérico ===
        return (
          <div key={name} style={{ gridColumn: column }}>
            <label htmlFor={name} className={label?.className}>
              {label?.name || label}
            </label>
            <input
              id={name}
              name={name}
              type={type || 'text'}
              placeholder={field.placeholder}
              value={value}
              disabled={readOnly}
              onChange={(e) => onChange(name, e.target.value)}
              style={{ width: '100%' }}
              maxLength={field.maxLength} // ✅ soporta atributos adicionales
              inputMode={field.inputMode} // ✅ soporta atributos adicionales
            />
            {showDescriptions && field.description && (
              <small>{field.description}</small>
            )}
          </div>
        );
      })}
    </div>
  );
}
