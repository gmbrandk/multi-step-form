// StepLineaServicio.jsx
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { SchemaForm } from './SchemaForm';

const fields = [
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
    label: { name: 'Nombre del trabajo', className: 'sr-only' },
    gridColumn: '1 / 4',
    placeholder: 'Ej: Instalación de software',
  },
  {
    name: 'cantidad',
    type: 'number',
    label: { name: 'Cantidad', className: 'sr-only' },
    gridColumn: '1 / 2',
    defaultValue: 1,
    visibleWhen: (values) => values.categoria === 'producto',
  },
  {
    name: 'precioUnitario',
    type: 'number',
    label: { name: 'Precio unitario', className: 'sr-only' },
    gridColumn: (values) =>
      values.categoria === 'servicio' ? '1 / 2' : '2 / 3',
    defaultValue: 0,
    defaultValue: 0,
  },
  {
    name: 'subTotal',
    type: 'output',
    label: { name: 'SubTotal', className: 'sr-only' },
    gridColumn: (values) =>
      values.categoria === 'servicio' ? '2 / 3' : '3 / 4',
    defaultValue: 0,
    defaultValue: 0,
  },
];

export function StepLineaServicio({ index }) {
  const { orden, handleChangeLinea, handleAgregarLinea } =
    useOrdenServicioContext();
  const linea = orden.lineas[index];
  const gridTemplate =
    linea.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
  if (!linea) {
    return <p>⚠️ No hay datos para esta línea</p>;
  }

  return (
    <div>
      <SchemaForm
        values={linea}
        onChange={(field, value) => handleChangeLinea(index, field, value)}
        fields={fields}
        showDescriptions={false}
        readOnly={false}
        gridTemplateColumns={gridTemplate}
      />

      <button
        type="button"
        onClick={handleAgregarLinea}
        style={{ marginTop: '1rem' }}
      >
        ➕ Agregar nueva línea
      </button>
    </div>
  );
}
