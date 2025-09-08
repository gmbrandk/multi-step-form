import { baseOrden } from '../constantes';

export function SchemaForm({
  values = {},
  onChange,
  fields = [],
  gridTemplateColumns = 'repeat(3, 1fr)', // 👈 configurable desde Step3
}) {
  if (!fields.length) return null;

  // 🔧 helper para resolver valor respetando defaultValue
  const resolveValue = (field, values) => {
    const v = values[field.name];
    const isEmpty = v === undefined || v === null || v === '';
    const resolved = isEmpty
      ? field.defaultValue ?? baseOrden[field.name] ?? ''
      : v;

    return resolved;
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

        // 1️⃣ visibilidad condicional
        if (field.visibleWhen) {
          const isVisible = field.visibleWhen(values);
          if (!isVisible) return null;
        }

        // 2️⃣ grid dinámico
        const column =
          typeof field.gridColumn === 'function'
            ? field.gridColumn(values)
            : field.gridColumn;

        const value = resolveValue(field, values);

        // checkbox
        if (type === 'checkbox') {
          const col = column || '1 / -1';
          return (
            <div
              key={name}
              style={{ gridColumn: col }}
              className="fs-subtitle inline"
            >
              <label htmlFor={name}>
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => onChange(name, e.target.checked)}
                />
                <span>{label?.name || label}</span>
              </label>
            </div>
          );
        }

        // select
        if (type === 'select') {
          return (
            <div key={name} style={{ gridColumn: column }}>
              <label htmlFor={name} className={label?.className || ''}>
                {label?.name || label}
              </label>
              <select
                id={name}
                name={name}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%' }}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // textarea
        if (type === 'textarea') {
          return (
            <div key={name} style={{ gridColumn: column }}>
              <label htmlFor={name} className={label?.className || ''}>
                {label?.name || label}
              </label>
              <textarea
                id={name}
                name={name}
                placeholder={baseOrden[name]}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                style={{ width: '100%', minHeight: '60px' }}
              />
            </div>
          );
        }

        // output (subTotal)
        if (name === 'subTotal') {
          return (
            <div key={name} style={{ gridColumn: column }}>
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
                {value}
              </output>
            </div>
          );
        }

        // input genérico
        return (
          <div key={name} style={{ gridColumn: column }}>
            <label htmlFor={name} className={label?.className || ''}>
              {label?.name || label}
            </label>
            <input
              id={name}
              name={name}
              type={type || 'text'}
              placeholder={baseOrden[name]}
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
              style={{
                width: '100%',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
