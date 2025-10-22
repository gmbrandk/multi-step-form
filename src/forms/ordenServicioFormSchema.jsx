export function buildOrdenServicioFields({ linea = {}, tiposTrabajo = [] }) {
  const tiposTrabajoSafe = Array.isArray(tiposTrabajo) ? tiposTrabajo : [];
  console.log('🔍 Extraido de Backend:', tiposTrabajoSafe);

  // Extraer tipos únicos (por ejemplo: servicio, producto)
  const tiposUnicos = [
    ...new Set(
      tiposTrabajoSafe
        .map((t) => t.tipo)
        .filter((tipo) => typeof tipo === 'string' && tipo.trim() !== '')
    ),
  ].map((tipo) => ({
    value: tipo,
    label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
  }));

  console.log('🔍 Tipos únicos:', tiposUnicos);

  // 🔧 Filtrar tipos de trabajo según el tipo actual
  const trabajosFiltrados = tiposTrabajoSafe
    .filter((t) => t.tipo === linea.tipo)
    .map((t) => ({
      value: t.value || t._id || t.id || '',
      label: t.label || t.nombre || t.descripcion || '(Sin nombre)',
    }));

  console.log('🔍 Trabajos filtrados:', trabajosFiltrados);

  return [
    {
      name: 'tipo',
      type: 'select',
      label: { name: 'Tipo', className: 'sr-only' },
      gridColumn: '1 / 4',
      placeholder: 'Selecciona un tipo...',
      defaultValue: linea.tipo || '',
      options: tiposUnicos,
    },
    {
      name: 'tipoTrabajo',
      type: 'select',
      label: { name: 'Tipo de Trabajo', className: 'sr-only' },
      gridColumn: '1 / 4',
      placeholder: 'Selecciona un tipo de trabajo...',
      defaultValue: linea.tipoTrabajo || '',
      options: trabajosFiltrados,
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
      visibleWhen: (values) => values.tipo === 'producto',
    },
    {
      name: 'precioUnitario',
      type: 'number',
      label: { name: 'Precio unitario', className: 'sr-only' },
      placeholder: 'Ej: 150.00',
      gridColumn: (values) => (values.tipo === 'servicio' ? '1 / 2' : '2 / 3'),
      defaultValue: 0,
    },
    {
      name: 'subTotal',
      type: 'output',
      label: { name: 'SubTotal', className: 'sr-only' },
      gridColumn: (values) => (values.tipo === 'servicio' ? '2 / 3' : '3 / 4'),
      defaultValue: 0,
    },
  ];
}
