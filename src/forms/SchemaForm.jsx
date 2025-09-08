import { baseOrden } from '../constantes';

/**
 * SchemaForm: renderiza campos de manera declarativa según `fields`.
 * - Agnóstica: no conoce negocio (usa `values`, `onChange`, `fields`).
 * - En proceso de desacoplar renderers para mejorar escalabilidad.
 */
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
    return isEmpty ? field.defaultValue ?? baseOrden[field.name] ?? '' : v;
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
        const { name, type, label } = field;

        // 1️⃣ Visibilidad condicional
        if (field.visibleWhen && !field.visibleWhen(values)) return null;

        // 2️⃣ Grid dinámico
        const column =
          typeof field.gridColumn === 'function'
            ? field.gridColumn(values)
            : field.gridColumn;

        const value = resolveValue(field, values);

        // === Renderizado por tipo ===
        if (type === 'checkbox') {
          return (
            <div key={name} style={{ gridColumn: column || '1 / -1' }}>
              <label htmlFor={name} className={label?.className}>
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  checked={!!value}
                  disabled={readOnly}
                  onChange={(e) => {
                    console.log(`☑️ Checkbox ${name} →`, e.target.checked);
                    onChange(name, e.target.checked); // 👈 envía true/false
                  }}
                  style={{ marginRight: '8px' }}
                />
                {label?.name || label}
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
                placeholder={baseOrden[name]}
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
                  textAlign: 'right',
                  fontWeight: 'bold',
                  background: '#eee',
                  padding: '4px 6px',
                  borderRadius: '4px',
                }}
              >
                {value}
              </output>
            </div>
          );
        }

        // input genérico (text, number, datetime-local, etc.)
        return (
          <div key={name} style={{ gridColumn: column }}>
            <label htmlFor={name} className={label?.className}>
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
            {showDescriptions && field.description && (
              <small>{field.description}</small>
            )}
          </div>
        );
      })}
    </div>
  );
}
