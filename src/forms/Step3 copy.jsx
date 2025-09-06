import { useLineaServicio } from '../useLineaServicio';
import { SchemaForm } from './SchemaForm';

export function Step3({ values = {}, onChange }) {
  const { linea, handleChange } = useLineaServicio(values, onChange);

  return (
    <SchemaForm
      values={linea}
      onChange={handleChange}
      fields={[
        {
          name: 'tipoTrabajo',
          type: 'select',
          label: { name: 'Tipo de trabajo', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'nombreTrabajo',
          type: 'text',
          label: { name: 'Nombre del trabajo', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: { name: 'Descripción', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'cantidad',
          type: 'number',
          label: { name: 'Cantidad', className: 'sr-only' },
          gridColumn: '1 / 2',
        },
        {
          name: 'precioUnitario',
          type: 'number',
          label: { name: 'Precio unitario', className: 'sr-only' },
          gridColumn: '2 / 3',
        },
        {
          name: 'total',
          type: 'output', // 👈 usamos output para solo lectura
          label: { name: 'Total', className: 'sr-only' },
          gridColumn: '3 / 4',
        },
      ]}
    />
  );
}
