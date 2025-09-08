import { SchemaForm } from './SchemaForm';

const fields = [
  {
    name: 'categoria',
    type: 'select',
    label: { name: 'Categoría', className: 'sr-only' },
    gridColumn: '1 / 4',
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
    gridColumn: '2 / 3',
  },
  {
    name: 'subTotal',
    type: 'output',
    label: { name: 'SubTotal', className: 'sr-only' },
    gridColumn: '3 / 4',
  },
];

export function StepLineaServicio({ values = [], onChange }) {
  const handleLineaChange = (index, field, value) => {
    const nuevas = [...values];
    nuevas[index] = { ...nuevas[index], [field]: value };

    // recalculamos subtotal si corresponde
    if (field === 'cantidad' || field === 'precioUnitario') {
      const cantidad = Number(nuevas[index].cantidad || 0);
      const precio = Number(nuevas[index].precioUnitario || 0);
      nuevas[index].subTotal = cantidad * precio;
    }

    onChange(nuevas);
  };

  const handleAddLinea = () => {
    onChange([
      ...values,
      {
        categoria: 'servicio',
        nombreTrabajo: '',
        cantidad: 1,
        precioUnitario: 0,
        subTotal: 0,
      },
    ]);
  };

  const handleRemoveLinea = (index) => {
    const nuevas = values.filter((_, i) => i !== index);
    onChange(nuevas);
  };

  return (
    <div>
      {values.map((linea, index) => (
        <div key={index} style={{ marginBottom: '16px' }}>
          <SchemaForm
            values={linea}
            onChange={(field, value) => handleLineaChange(index, field, value)}
            fields={fields}
            gridTemplateColumns="repeat(3, 1fr)"
          />
          <button type="button" onClick={() => handleRemoveLinea(index)}>
            ❌ Eliminar línea
          </button>
        </div>
      ))}

      <button type="button" onClick={handleAddLinea}>
        ➕ Agregar otra línea
      </button>
    </div>
  );
}
