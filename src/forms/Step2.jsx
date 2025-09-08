import { useOrdenServicioContext } from '../OrdenServicioContext';

const baseEquipo = {
  tipo: 'Ej: laptop',
  marca: 'Ej: Toshiba',
  modelo: 'Ej: Satellite L45',
  sku: 'Ej: L45B4205FL',
  macAddress: 'Ej: FA:KE:28:08:25:03',
  nroSerie: 'Ej: 3BO52134Q',
};

// 🔹 helper de log solo en producción
const prodLog = (...args) => {
  if (process.env.NODE_ENV === 'production') {
    console.info(...args);
  }
};

export function Step2() {
  const { orden, handleChangeOrden } = useOrdenServicioContext();
  const equipo = orden.equipo || {};

  const handleChange = (field, value) => {
    prodLog(`[Step2] Campo actualizado → ${field}:`, value);
    handleChangeOrden('equipo', { ...equipo, [field]: value });
  };

  const handleCheckbox = (e) => {
    const checked = e.target.checked;
    prodLog(`[Step2] Checkbox "especificaciones":`, checked);
    handleChangeOrden('equipo', { ...equipo, especificaciones: checked });
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
            value={equipo[field] || ''}
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
