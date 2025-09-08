import { useLineaServicio } from '../useLineaServicio';
import { SchemaForm } from './SchemaForm';

export function Step3({ values = {}, onChange }) {
  const { linea, handleChange } = useLineaServicio(values, onChange);
  console.log('[Step3.render]', { values, linea });
  // 👇 lógica estética queda acá, no en SchemaForm

  const gridTemplate =
    linea.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // 🔍 debug log
  console.log('[Step3 → SchemaForm.props]', {
    linea,
    gridTemplate,
    values,
  });

  return (
    <SchemaForm
      values={{ ...linea }} // 👈 pasamos resuelto
      onChange={handleChange}
      showDescriptions={false} // 🔕 oculta todas las descripciones
      readOnly={false} // 🔒 bloquea el formulario
      gridTemplateColumns={gridTemplate} // 👈 pasa layout
      fields={[
        {
          name: 'categoria',
          type: 'select',
          label: { name: 'Categoría', className: 'sr-only' },
          gridColumn: '1 / 4',
          defaultValue: 'servicio', // 👈 opcional, valor inicial
          options: [
            { value: 'servicio', label: 'Servicios' },
            { value: 'producto', label: 'Productos' },
          ],
          description: 'Selecciona si corresponde a un servicio o un producto',
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
          gridColumn: '1 / 2',
          visibleWhen: (values) => values.categoria === 'producto',
        },
        {
          name: 'precioUnitario',
          type: 'number',
          label: { name: 'Precio unitario', className: 'sr-only' },
          gridColumn: (values) =>
            values.categoria === 'servicio' ? '1 / 2' : '2 / 3',
        },
        {
          name: 'subTotal',
          type: 'output',
          label: { name: 'subTotal', className: 'sr-only' },
          gridColumn: (values) =>
            values.categoria === 'servicio' ? '2 / 3' : '3 / 4',
        },
        {
          name: 'crearLinea',
          type: 'checkbox',
          label: {
            name: 'Crear nueva línea de Servicio',
            className: 'fs-subtitle inline',
          },
          gridColumn: '1 / 4',
          defaultValue: false, // arranca desmarcado
          description:
            'Marca esta casilla si deseas agregar otra línea de servicio',
        },
      ]}
    />
  );
}
