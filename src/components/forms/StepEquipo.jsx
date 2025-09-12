import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { SchemaForm } from './SchemaForm';

// 🔹 helper de log solo en producción
const prodLog = (...args) => {
  if (process.env.NODE_ENV === 'production') {
    console.info(...args);
  }
};

const equipoFields = [
  {
    name: 'tipo',
    type: 'text',
    label: { name: 'Tipo', className: 'sr-only' },
    placeholder: 'Ej: Laptop',
    gridColumn: '1 / 4',
  },
  {
    name: 'marca',
    type: 'text',
    label: { name: 'Marca', className: 'sr-only' },
    placeholder: 'Ej: Toshiba',
    gridColumn: '1 / 4',
  },
  {
    name: 'modelo',
    type: 'text',
    label: { name: 'Modelo', className: 'sr-only' },
    placeholder: 'Ej: Satellite L45',
    gridColumn: '1 / 4',
  },
  {
    name: 'sku',
    type: 'text',
    label: { name: 'SKU', className: 'sr-only' },
    placeholder: 'Ej: L45B4205FL',
    gridColumn: '1 / 4',
  },
  {
    name: 'macAddress',
    type: 'text',
    label: { name: 'MAC Address', className: 'sr-only' },
    placeholder: 'Ej: FA:KE:28:08:25:03',
    gridColumn: '1 / 4',
  },
  {
    name: 'nroSerie',
    type: 'text',
    label: { name: 'Nro. Serie', className: 'sr-only' },
    placeholder: 'Ej: 3BO52134Q',
    gridColumn: '1 / 4',
  },
  {
    name: 'especificaciones',
    type: 'checkbox',
    className: 'fs-subtitle inline',
    label: { name: 'Agregar especificaciones de equipo' },
    gridColumn: '1 / 4',
    defaultValue: false,
  },
];

export function StepEquipo() {
  const { orden, handleChangeOrden } = useOrdenServicioContext();
  const equipo = orden.equipo || {};

  return (
    <SchemaForm
      values={orden.equipo || {}} // 👈 leemos desde el Context
      onChange={(field, value) => {
        prodLog(`🔄 Step2.onChange → ${field}:`, value);
        handleChangeOrden('equipo', { ...orden.equipo, [field]: value });
      }}
      fields={equipoFields}
      gridTemplateColumns="repeat(3, 1fr)"
      showDescriptions={false}
    />
  );
}
