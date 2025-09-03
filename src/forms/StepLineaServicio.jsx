import { useState } from 'react';

const baseOrden = {
  categoria: 'servicio',
  nombreTrabajo: 'Mantenimiento general',
  fechaIngreso: '',
  diagnostico: 'Equipo enciende pero se apaga solo',
  observaciones: 'Cliente indicó que el problema empezó hace 2 días',
  cantidad: '1',
  precioUnitario: '150',
  total: '150',
  crearLinea: false,
};

export function StepLineaServicio({ values = {}, onChange, fields = [] }) {
  const [orden, setOrden] = useState({
    ...baseOrden,
    ...values,
  });

  const handleChange = (field, value) => {
    let updated = { ...orden, [field]: value };

    if (field === 'categoria' && value === 'servicio') {
      updated.cantidad = '1';
    }

    const cantidad =
      updated.categoria === 'servicio' ? 1 : parseFloat(updated.cantidad || 0);
    const precio = parseFloat(updated.precioUnitario || 0);
    updated.total = (cantidad * precio).toFixed(2);

    setOrden(updated);
    if (onChange) onChange(updated);
  };

  if (!fields.length) {
    return <p>No hay campos para mostrar ⚠️</p>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          orden.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      }}
    >
      {fields.map(({ name, type, label, gridColumn }) => {
        // Ocultar cantidad si es servicio
        if (name === 'cantidad' && orden.categoria === 'servicio') {
          return null;
        }

        // 🔥 Ajustar dinámicamente columnas si falta cantidad
        let column = gridColumn;
        if (orden.categoria === 'servicio') {
          if (name === 'precioUnitario') column = '1 / 2';
          if (name === 'total') column = '2 / 3'; // 👈 ahora mitad-mitad
        }

        // checkbox con diseño especial
        if (type === 'checkbox') {
          const column = gridColumn || '1 / -1'; // ocupa todas las columnas por defecto

          return (
            <div
              key={name}
              className="fs-subtitle inline"
              style={{
                marginTop: '1rem',
                gridColumn: column, // 👈 se integra al grid si lo quieres
              }}
            >
              <label>
                <input
                  id={name}
                  name={name}
                  type="checkbox"
                  checked={!!orden[name]}
                  onChange={(e) => handleChange(name, e.target.checked)}
                />
                <span>{label?.name || label}</span>
              </label>
            </div>
          );
        }

        // select categoría
        if (type === 'select' && name === 'categoria') {
          return (
            <div key={name} style={{ gridColumn }}>
              <label htmlFor={name} className={label?.className || ''}>
                {label?.name || label}
              </label>
              <select
                id={name}
                name={name}
                value={orden[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="servicio">Servicios</option>
                <option value="producto">Productos</option>
              </select>
            </div>
          );
        }

        // textarea
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
                value={orden[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                style={{ width: '100%', minHeight: '60px' }}
              />
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
              value={orden[name]}
              onChange={(e) => handleChange(name, e.target.value)}
              readOnly={name === 'total'}
              style={{
                width: '100%',
                ...(name === 'total'
                  ? {
                      fontWeight: 'bold',
                      textAlign: 'right',
                      background: '#f9f9f9',
                    }
                  : {}),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
