import { AutocompleteField } from './AutoCompleteField';

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

  // ⚡ attachRef ahora usa idx estable
  const attachRef = (field, idx) => {
    return (el) => {
      // console.log(
      //   `[SchemaForm][attachRef] field="${field.name}" idx=${idx} el=`,
      //   el
      // );
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
        if (field.visibleWhen && !field.visibleWhen(values)) return null;

        const column =
          typeof field.gridColumn === 'function'
            ? field.gridColumn(values)
            : field.gridColumn;

        const value = resolveValue(field, values);

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
              onChange={(e) => {
                onChange(name, e.target.value);
                field.onChange?.(e);
              }}
              onKeyDown={field.onKeyDown}
              onPointerDown={field.onPointerDown}
              onFocus={field.onFocus}
              onBlur={field.onBlur}
              onSelect={field.onSelect}
              inputRef={attachRef(field, idx)} // 👈 usamos inputRef aquí
            />
          );
        }

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
              onKeyDown={field.onKeyDown} // 👈 añadir esto
              style={{ width: '100%' }}
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
