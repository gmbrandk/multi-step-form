import { useState } from 'react';

const baseEquipo = {
  tipo: 'Ej: laptop',
  marca: 'Ej: Toshiba',
  modelo: 'Ej: Satellite L45',
  sku: 'Ej: L45B4205FL',
  macAddress: 'Ej: FA:KE:28:08:25:03',
  nroSerie: 'Ej: 3BO52134Q',
};

export function Step2({ values = {}, onChange }) {
  const [equipo, setEquipo] = useState({
    ...Object.fromEntries(Object.keys(baseEquipo).map((k) => [k, ''])),
    ...values,
  });

  const handleChange = (field, value) => {
    const updated = { ...equipo, [field]: value };
    setEquipo(updated);
    if (onChange) {
      // ✅ mandamos solo el campo cambiado
      onChange(field, value);
    }
  };

  const handleCheckbox = (e) => {
    const checked = e.target.checked;
    setEquipo((prev) => ({ ...prev, especificaciones: checked }));
    if (onChange) {
      // ✅ subimos el flag como campo individual
      onChange('especificaciones', checked);
    }
  };

  return (
    <>
      {Object.keys(baseEquipo).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="sr-only">
            {field}
          </label>
          <input
            id={field}
            name={field}
            placeholder={baseEquipo[field]}
            value={equipo[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      ))}

      <div
        className="fs-subtitle inline"
        style={{
          marginTop: '1rem',
          justifySelf: 'center',
          alignSelf: 'center',
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={!!equipo.especificaciones}
            onChange={handleCheckbox}
          />
          <span>Agregar especificaciones de equipo</span>
        </label>
      </div>
    </>
  );
}
