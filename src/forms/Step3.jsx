import { StepLineaServicio } from './StepLineaServicio';

export function Step3({ values = {}, onChange }) {
  return (
    <StepLineaServicio
      values={values}
      onChange={onChange}
      fields={[
        {
          name: 'categoria',
          type: 'select',
          label: { name: 'Categoría', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'nombreTrabajo',
          type: 'text',
          label: { name: 'Nombre del trabajo', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'fechaIngreso',
          type: 'datetime-local',
          label: { name: 'Fecha de ingreso', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'diagnostico',
          type: 'textarea',
          label: { name: 'Diagnóstico', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'observaciones',
          type: 'textarea',
          label: { name: 'Observaciones', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'cantidad',
          type: 'number',
          label: { name: 'Cantidad', className: 'sr-only' },
          gridColumn: '1 / 2', // 👈 columna 1
        },
        {
          name: 'precioUnitario',
          type: 'number',
          label: { name: 'Precio unitario', className: 'sr-only' },
          gridColumn: '2 / 3', // 👈 columna 2
        },
        {
          name: 'total',
          type: 'number',
          label: { name: 'Total', className: 'sr-only' },
          gridColumn: '3 / 4', // 👈 columna 3
        },
        {
          name: 'crearLinea',
          type: 'checkbox',
          label: { name: 'Crear nueva línea de Servicio', className: '' },
          gridColumn: '1 / 4',
        },
      ]}
    />
  );
}
