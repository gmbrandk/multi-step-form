import { baseOrden } from '../constantes';

export function SchemaForm({
  values = {},
  onChange,
  fields = [],
  showDescriptions = true, // ✅ controla descripción global
  readOnly = false, // ✅ modo solo lectura
}) {
  if (!fields.length) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}
    >
      {fields.map((field) => {
        const {
          name,
          type,
          label,
          gridColumn,
          options,
          description,
          defaultValue,
        } = field;

        const value =
          values[name] ?? defaultValue ?? (type === 'checkbox' ? false : '');

        // 📌 Render checkbox
        if (type === 'checkbox') {
          const col = gridColumn || '1 / -1';
          return (
            <div
              key={name}
              style={{ gridColumn: col }}
              className="fs-subtitle inline"
            >
              <label htmlFor={name} className={label?.className || ''}>
                <input
                  type="checkbox"
                  id={name}
                  name={name}
                  checked={!!value}
                  disabled={readOnly}
                  onChange={(e) => onChange(name, e.target.checked)}
                />
                <span>{label?.name || label}</span>
              </label>
              {showDescriptions && description && (
                <small style={{ display: 'block', color: '#555' }}>
                  {description}
                </small>
              )}
            </div>
          );
        }

        // 📌 Render select
        if (type === 'select') {
          return (
            <div key={name} style={{ gridColumn }}>
              <label htmlFor={name} className={label?.className || ''}>
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
                {options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showDescriptions && description && (
                <small style={{ display: 'block', color: '#555' }}>
                  {description}
                </small>
              )}
            </div>
          );
        }

        // 📌 Render textarea
        if (type === 'textarea') {
          return (
            <div key={name} style={{ gridColumn }}>
              <label htmlFor={name} className={label?.className || ''}>
                {label?.name || label}
              </label>
              <textarea
                id={name}
                name={name}
                placeholder={baseOrden[name]}
                value={value}
                disabled={readOnly}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%', minHeight: '60px' }}
              />
              {showDescriptions && description && (
                <small style={{ display: 'block', color: '#555' }}>
                  {description}
                </small>
              )}
            </div>
          );
        }

        if (type === 'output') {
          return (
            <div key={name} style={{ gridColumn }}>
              <label htmlFor={name} className={label?.className || ''}>
                {label?.name || label}
              </label>
              <output
                id={name}
                name={name}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  background: '#eee',
                }}
              >
                {values[name]}
              </output>
            </div>
          );
        }

        // 📌 Render normal input
        return (
          <div key={name} style={{ gridColumn }}>
            <label htmlFor={name} className={label?.className || ''}>
              {label?.name || label}
            </label>
            <input
              id={name}
              name={name}
              type={type || 'text'}
              placeholder={baseOrden[name]}
              value={value}
              disabled={readOnly}
              onChange={(e) => onChange(name, e.target.value)}
              style={{ width: '100%' }}
            />
            {showDescriptions && description && (
              <small style={{ display: 'block', color: '#555' }}>
                {description}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
}
