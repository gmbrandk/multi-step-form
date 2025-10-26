export function buildOrdenServicioFields({ linea = {}, tiposTrabajo = [] }) {
  const tiposUnicos = [...new Set(tiposTrabajo.map((t) => t.tipo))].map(
    (tipo) => ({
      value: tipo,
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    })
  );

  const trabajosFiltrados = tiposTrabajo
    .filter((t) => t.tipo === linea.tipo)
    .map((t) => ({
      value: t.value,
      label: t.label,
    }));

  return [
    {
      name: 'tipo',
      type: 'select',
      label: { name: 'Tipo', className: 'sr-only' },
      gridColumn: '1 / 4',
      placeholder: 'Selecciona un tipo...',
      defaultValue: linea.tipo || '',
      options: tiposUnicos,
      localEditable: false, // ⚠️ Depende de datos externos
    },
    {
      name: 'tipoTrabajo',
      type: 'select',
      label: { name: 'Tipo de Trabajo', className: 'sr-only' },
      gridColumn: '1 / 4',
      placeholder: 'Selecciona un tipo de trabajo...',
      defaultValue: linea.tipoTrabajo || '',
      options: trabajosFiltrados,
      localEditable: false, // ⚠️ Depende de datos externos
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: { name: 'Descripción', className: 'sr-only' },
      placeholder: 'Ej: Limpieza interna y chequeo de hardware',
      gridColumn: '1 / 4',
      localEditable: true, // ✅ editable siempre
    },
    {
      name: 'observaciones',
      type: 'textarea',
      label: { name: 'Observaciones', className: 'sr-only' },
      placeholder: 'Ej: Equipo con carcasa rallada',
      gridColumn: '1 / 4',
      localEditable: true,
    },
    {
      name: 'cantidad',
      type: 'number',
      label: { name: 'Cantidad', className: 'sr-only' },
      placeholder: 'Ej: 1',
      gridColumn: '1 / 2',
      defaultValue: 1,
      visibleWhen: (values) => values.tipo === 'producto',
      localEditable: true,
    },
    {
      name: 'precioUnitario',
      type: 'number',
      label: { name: 'Precio unitario', className: 'sr-only' },
      placeholder: 'Ej: 150.00',
      gridColumn: (values) => (values.tipo === 'servicio' ? '1 / 2' : '2 / 3'),
      defaultValue: 0,
      localEditable: true,
    },
    {
      name: 'subTotal',
      type: 'output',
      label: { name: 'SubTotal', className: 'sr-only' },
      gridColumn: (values) => (values.tipo === 'servicio' ? '2 / 3' : '3 / 4'),
      defaultValue: 0,
      localEditable: true,
    },
  ];
}
