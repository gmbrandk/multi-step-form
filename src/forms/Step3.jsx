import { useOrdenServicioContext } from '../OrdenServicioContext';
import { SchemaForm } from './SchemaForm';

// 🔹 helper de log solo en producción
const prodLog = (...args) => {
  if (process.env.NODE_ENV === 'production') {
    console.info(...args);
  }
};

export function Step3() {
  const { orden, handleChangeLinea } = useOrdenServicioContext();
  const linea = orden.lineas[0] || {};
  const gridTemplate =
    linea.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // 📌 Logs visibles SOLO en producción (momentáneos para debug en vivo)
  prodLog('📌 Step3.linea:', JSON.stringify(linea, null, 2));
  prodLog('📌 Step3.linea.categoria:', linea?.categoria);

  return (
    <SchemaForm
      values={linea}
      onChange={(field, value) => {
        prodLog(`🔄 Step3.onChange → ${field}:`, value);
        handleChangeLinea(0, field, value); // 👈 actualiza línea + root.crearLinea
      }}
      showDescriptions={false}
      readOnly={false}
      gridTemplateColumns={gridTemplate}
      fields={[
        {
          name: 'categoria',
          type: 'select',
          label: { name: 'Categoría', className: 'sr-only' },
          gridColumn: '1 / 4',
          defaultValue: 'servicio',
          options: [
            { value: 'servicio', label: 'Servicios' },
            { value: 'producto', label: 'Productos' },
          ],
        },
        {
          name: 'nombreTrabajo',
          type: 'text',
          label: { name: 'Nombre', className: 'sr-only' },
          placeholder: 'Ej: Cambio de pantalla',
          gridColumn: '1 / 4',
        },
        {
          name: 'fechaIngreso',
          type: 'datetime-local',
          label: { name: 'Fecha', className: 'sr-only' },
          placeholder: 'Selecciona fecha y hora',
          gridColumn: '1 / 4',
        },
        {
          name: 'diagnostico',
          type: 'textarea',
          label: { name: 'Diagnóstico', className: 'sr-only' },
          placeholder: 'Ej: El equipo no enciende al presionar el botón',
          gridColumn: '1 / 4',
        },
        {
          name: 'observaciones',
          type: 'textarea',
          label: { name: 'Observaciones', className: 'sr-only' },
          placeholder: 'Notas adicionales sobre el servicio',
          gridColumn: '1 / 4',
        },
        {
          name: 'cantidad',
          type: 'number',
          label: { name: 'Cantidad', className: 'sr-only' },
          placeholder: 'Ej: 1',
          gridColumn: '1 / 2',
          visibleWhen: (values) => values.categoria === 'producto',
        },
        {
          name: 'precioUnitario',
          type: 'number',
          label: { name: 'Precio unitario', className: 'sr-only' },
          placeholder: 'Ej: 150.00',
          gridColumn: (values) =>
            values.categoria === 'servicio' ? '1 / 2' : '2 / 3',
        },
        {
          name: 'subTotal',
          type: 'output',
          label: { name: 'SubTotal', className: 'sr-only' },
          gridColumn: (values) =>
            values.categoria === 'servicio' ? '2 / 3' : '3 / 4',
        },
        {
          name: 'crearLinea',
          type: 'checkbox',
          className: 'fs-subtitle inline',
          label: {
            name: 'Crear nueva línea de Servicio',
          },
          gridColumn: '1 / 4',
          defaultValue: false,
        },
      ]}
    />
  );
}
