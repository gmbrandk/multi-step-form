import { useCallback, useMemo } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { SchemaForm } from './SchemaForm';

// 🔹 Mantener `fields` fuera del componente evita recrearlo en cada render
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
    name: 'tipoTrabajo',
    type: 'select',
    label: { name: 'Tipo de Trabajo', className: 'sr-only' },
    gridColumn: '1 / 4',
    options: [
      { value: '68a74570f2ab41918da7f937', label: 'Mantenimiento Preventivo' },
      { value: '68afd6a2c19b8c72a13decb0', label: 'Diagnóstico' },
      { value: '68dc9ac76162927555649baa', label: 'Formateo' },
      { value: '68e335329e1eff2fcb38b733', label: 'Venta de Repuesto' },
    ],
    placeholder: 'Selecciona un tipo de trabajo...',
  },
  {
    name: 'descripcion',
    type: 'textarea',
    label: { name: 'Descripción', className: 'sr-only' },
    placeholder: 'Ej: Limpieza interna y chequeo de hardware',
    gridColumn: '1 / 4',
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

export function StepLineaServicio({ index }) {
  const { orden, handleChangeLinea, handleAgregarLinea } =
    useOrdenServicioContext();

  // ✅ Memorizar la línea actual para evitar cambiar su referencia en cada render
  const linea = useMemo(() => orden.lineas[index], [orden.lineas, index]);

  if (!linea) {
    return <p>⚠️ No hay datos para esta línea</p>;
  }

  const gridTemplate = useMemo(
    () =>
      linea.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    [linea.categoria]
  );

  const handleAddLinea = useCallback(() => {
    if (!linea.tipoTrabajo) {
      alert(
        '⚠️ Debes seleccionar un tipo de trabajo antes de agregar otra línea.'
      );
      return;
    }
    handleAgregarLinea();
  }, [linea.tipoTrabajo, handleAgregarLinea]);

  const handleFieldChange = useCallback(
    (field, value) => {
      handleChangeLinea(index, field, value);
    },
    [index, handleChangeLinea]
  );

  console.log('🔁 Render StepLineaServicio index:', index);

  return (
    <div>
      <SchemaForm
        values={linea}
        onChange={handleFieldChange}
        fields={fields}
        showDescriptions={false}
        readOnly={false}
        gridTemplateColumns={gridTemplate}
      />

      <button
        type="button"
        onClick={handleAddLinea}
        style={{ marginTop: '1rem' }}
      >
        ➕ Agregar nueva línea
      </button>
    </div>
  );
}
