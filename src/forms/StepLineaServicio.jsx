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
    defaultValue: '',
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
    gridColumn: '2 / 3',
    defaultValue: 0,
  },
  {
    name: 'subTotal',
    type: 'output',
    label: { name: 'SubTotal', className: 'sr-only' },
    gridColumn: '3 / 4',
    defaultValue: 0,
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

    console.log(`🔄 handleLineaChange: linea[${index}].${field} =`, value);
    onChange(nuevas);
  };

  // condition render
  if (!values || values.length === 0) {
    console.warn('⚠️ StepLineaServicio: values vacío');
    return <p>No hay líneas de servicio para mostrar.</p>;
  }

  return (
    <div>
      {values.map((linea, index) => {
        console.log(`📌 Renderizando linea[${index}]:`, linea);

        return (
          <div key={index} style={{ marginBottom: '16px' }}>
            <SchemaForm
              values={linea}
              onChange={(field, value) =>
                handleLineaChange(index, field, value)
              }
              fields={fields}
              gridTemplateColumns="repeat(3, 1fr)"
            />
          </div>
        );
      })}
    </div>
  );
}
