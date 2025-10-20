// forms/ordenServicioFormSchema.js

export function buildOrdenServicioFields({ linea }) {
  return [
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
      name: 'tipoTrabajo',
      type: 'select',
      label: { name: 'Tipo de Trabajo', className: 'sr-only' },
      gridColumn: '1 / 4',
      defaultValue: '68afd6a2c19b8c72a13decb0',
      options: [
        {
          value: '68a74570f2ab41918da7f937',
          label: 'Mantenimiento Preventivo',
        },
        { value: '68afd6a2c19b8c72a13decb0', label: 'Diagnóstico' },
        { value: '68dc9ac76162927555649baa', label: 'Formateo' },
        { value: '68e335329e1eff2fcb38b733', label: 'Venta de Repuesto' },
      ],
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: { name: 'Descripción', className: 'sr-only' },
      placeholder: 'Ej: Limpieza interna y chequeo de hardware',
      gridColumn: '1 / 4',
    },
    {
      name: 'observaciones',
      type: 'textarea',
      label: { name: 'Observaciones', className: 'sr-only' },
      placeholder: 'Ej: Equipo con carcasa rallada',
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
  ];
}
