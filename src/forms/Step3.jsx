// Step3.jsx
import { useState } from 'react';

const baseOrden = {
  tipo: 'mantenimiento',
  fechaIngreso: '',
  diagnostico: 'Equipo enciende pero se apaga solo',
  observaciones: 'Cliente indicó que el problema empezó hace 2 días',
  nombreTrabajo: 'Mantenimiento general',
  cantidad: '1',
  precioUnitario: '150',
  total: '150',
};

const fieldTypes = {
  tipo: 'text',
  fechaIngreso: 'datetime-local',
  diagnostico: 'textarea',
  observaciones: 'textarea',
  nombreTrabajo: 'text',
  cantidad: 'number',
  precioUnitario: 'number',
  total: 'number',
};

// 👇 Layout para organizar campos
const fieldLayout = {
  nombreTrabajo: { grid: '3fr', group: 'trabajo' },
  cantidad: { grid: '1fr', group: 'trabajo' },
  precioUnitario: { grid: '1fr', group: 'costos' },
  total: { grid: '1fr', group: 'costos' },
};

export function Step3({ values = {}, onChange }) {
  const [orden, setOrden] = useState(
    Object.fromEntries(Object.keys(baseOrden).map((k) => [k, values[k] ?? '']))
  );

  const handleChange = (field, value) => {
    const updated = { ...orden, [field]: value };

    if (field === 'cantidad' || field === 'precioUnitario') {
      const cantidad = parseFloat(updated.cantidad || 0);
      const precio = parseFloat(updated.precioUnitario || 0);
      updated.total = (cantidad * precio).toFixed(2);
    }

    setOrden(updated);
    if (onChange) onChange(updated);
  };

  // 👉 agrupamos campos según "group"
  const normalFields = Object.keys(baseOrden).filter((f) => !fieldLayout[f]);
  const groupedBy = (group) =>
    Object.entries(fieldLayout).filter(([_, v]) => v.group === group);

  return (
    <>
      {/* Campos normales */}
      {normalFields.map((field) => (
        <div key={field}>
          <label htmlFor={field} className="sr-only">
            {field}
          </label>
          {fieldTypes[field] === 'textarea' ? (
            <textarea
              id={field}
              name={field}
              placeholder={baseOrden[field]}
              value={orden[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{ width: '100%', minHeight: '80px' }}
            />
          ) : (
            <input
              id={field}
              name={field}
              type={fieldTypes[field] || 'text'}
              placeholder={baseOrden[field]}
              value={orden[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{ width: '100%' }}
            />
          )}
        </div>
      ))}

      {/* Grupo: trabajo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: groupedBy('trabajo')
            .map(([_, v]) => v.grid)
            .join(' '),
          gap: '0.5rem',
        }}
      >
        {groupedBy('trabajo').map(([field]) => (
          <div key={field}>
            <label htmlFor={field} className="sr-only">
              {field}
            </label>
            <input
              id={field}
              name={field}
              type={fieldTypes[field] || 'text'}
              placeholder={baseOrden[field]}
              value={orden[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>

      {/* Grupo: costos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: groupedBy('costos')
            .map(([_, v]) => v.grid)
            .join(' '),
          gap: '0.5rem',
        }}
      >
        {groupedBy('costos').map(([field]) => (
          <div key={field}>
            <label htmlFor={field} className="sr-only">
              {field}
            </label>
            <input
              id={field}
              name={field}
              type={fieldTypes[field] || 'text'}
              placeholder={baseOrden[field]}
              value={orden[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              readOnly={field === 'total'}
              style={{
                width: '100%',
                ...(field === 'total'
                  ? {
                      fontWeight: 'bold',
                      textAlign: 'right',
                      background: '#f9f9f9',
                    }
                  : {}),
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
