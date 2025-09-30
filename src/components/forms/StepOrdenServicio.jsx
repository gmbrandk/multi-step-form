// StepOrdenServicio.jsx
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { SchemaForm } from './SchemaForm';

export function StepOrdenServicio() {
  const { orden, handleChangeLinea } = useOrdenServicioContext();

  // 🔹 siempre con defaults si no hay línea
  const linea = orden.lineas[0] || createLineaServicio();

  const gridTemplate =
    linea.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  // ✅ logs solo en desarrollo
  if (process.env.NODE_ENV === 'production') {
    console.group(`📝 StepOrdenServicio`);
    console.log('values:', linea);
    console.log('categoria:', linea.categoria);
    console.log('cantidad:', linea.cantidad);
    console.groupEnd();
  }

  return (
    <SchemaForm
      values={linea}
      onChange={(field, value) => {
        if (process.env.NODE_ENV === 'production') {
          console.log(`🔄 StepOrdenServicio.onChange [${field}] =`, value);
        }
        handleChangeLinea(0, field, value);
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
          name: 'tipoTrabajo', // ✅ antes estaba mal, repetía "categoria"
          type: 'select',
          label: { name: 'Tipo de Trabajo', className: 'sr-only' },
          gridColumn: '1 / 4',
          defaultValue: '68afd6a2c19b8c72a13decb0',
          options: [
            { value: '68afd6a2c19b8c72a13decb0', label: 'Mantenimiento' },
            { value: '68afd6a2c19b8c72a13decb1', label: 'Reparación' },
            { value: '68afd6a2c19b8c72a13decb2', label: 'Repuesto' },
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
          name: 'descripcion', // ✅ faltaba
          type: 'textarea',
          label: { name: 'Descripción', className: 'sr-only' },
          placeholder: 'Ej: Limpieza interna y chequeo de hardware',
          gridColumn: '1 / 4',
        },
        {
          name: 'cantidad',
          type: 'number',
          label: { name: 'Cantidad', className: 'sr-only' },
          placeholder: 'Ej: 1',
          gridColumn: '1 / 2',
          defaultValue: 1,
          visibleWhen: (values) => values.categoria === 'producto',
        },
        {
          name: 'precioUnitario',
          type: 'number',
          label: { name: 'Precio unitario', className: 'sr-only' },
          placeholder: 'Ej: 150.00',
          gridColumn: (values) =>
            values.categoria === 'servicio' ? '1 / 2' : '2 / 3',
          defaultValue: 0,
        },
        {
          name: 'subTotal',
          type: 'output',
          label: { name: 'SubTotal', className: 'sr-only' },
          gridColumn: (values) =>
            values.categoria === 'servicio' ? '2 / 3' : '3 / 4',
          defaultValue: 0,
        },
        {
          name: 'crearLinea',
          type: 'checkbox',
          className: 'fs-subtitle inline',
          label: { name: 'Crear nueva línea de Servicio' },
          gridColumn: '1 / 4',
          defaultValue: false,
        },
      ]}
    />
  );
}
