import { AutocompleteField } from './AutocompleteField';

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

  // ✅ Nueva función para actualizar valores dentro del form
  const updateValue = (name, newValue) => {
    if (typeof onChange === 'function') {
      onChange(name, newValue);
    }
  };

  const attachRef = (field, idx) => {
    return (el) => {
      if (typeof field.inputRef === 'function') {
        field.inputRef(el);
      } else if (field.inputRef && 'current' in field.inputRef) {
        field.inputRef.current = el;
      }
    };
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        columnGap: '8px',
      }}
    >
      {fields.map((field, idx) => {
        const { name, type, label, className } = field;

        // 👇 Filtramos si no debe mostrarse
        if (field.visibleWhen && !field.visibleWhen(values)) return null;

        // 👇 Control de reactividad (si depende de otros campos)
        if (
          field.dependsOn &&
          Array.isArray(field.dependsOn) &&
          !field.dependsOn.some((dep) => dep in values)
        ) {
          return null;
        }

        const column =
          typeof field.gridColumn === 'function'
            ? field.gridColumn(values)
            : field.gridColumn;

        const value = resolveValue(field, values);

        // ⚡ AUTOCOMPLETE (con soporte onSelect extendido)
        if (type === 'autocomplete') {
          return (
            <AutocompleteField
              key={name}
              id={name}
              label={label}
              placeholder={field.placeholder}
              value={value}
              disabled={readOnly || field.disabled}
              suggestions={field.suggestions}
              showDropdown={field.showDropdown}
              activeIndex={field.activeIndex}
              gridColumn={column}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              renderSuggestion={field.renderSuggestion}
              withToggle={field.withToggle}
              onChange={(e) => {
                onChange(name, e.target.value);
                field.onChange?.(e);
              }}
              onKeyDown={field.onKeyDown}
              onPointerDown={field.onPointerDown}
              onFocus={field.onFocus}
              onBlur={field.onBlur}
              onSelect={(item, e) => {
                // ⚡ Ahora pasa updateValue y values
                if (field.onSelect) {
                  field.onSelect(item, e, updateValue, values);
                }
              }}
              inputRef={attachRef(field, idx)}
            />
          );
        }

        // ⚡ CUSTOM FIELD
        if (type === 'custom') {
          return (
            <div key={name} style={{ gridColumn: column }}>
              {field.render({
                value,
                onChange: (v) => onChange(name, v),
                values,
                updateValue,
              })}
            </div>
          );
        }

        // ✅ Checkbox
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
                  disabled={readOnly || field.disabled}
                  onChange={(e) => onChange(name, e.target.checked)}
                  ref={attachRef(field, idx)}
                />
                <span>{label?.name || label}</span>
              </label>
              {showDescriptions && field.description && (
                <small>{field.description}</small>
              )}
            </div>
          );
        }

        // ✅ Select
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
                disabled={readOnly || field.disabled}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%' }}
                onKeyDown={field.onKeyDown}
                ref={attachRef(field, idx)}
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

        // ✅ Textarea
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
                disabled={readOnly || field.disabled}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%', minHeight: '60px' }}
                onKeyDown={field.onKeyDown}
                ref={attachRef(field, idx)}
              />
              {showDescriptions && field.description && (
                <small>{field.description}</small>
              )}
            </div>
          );
        }

        // ✅ Output
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

        // ✅ Input por defecto
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
              disabled={readOnly || field.disabled}
              onChange={(e) => onChange(name, e.target.value)}
              onKeyDown={field.onKeyDown}
              style={{ width: '100%', marginBottom: '10px' }}
              maxLength={field.maxLength}
              inputMode={field.inputMode}
              ref={attachRef(field, idx)}
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
