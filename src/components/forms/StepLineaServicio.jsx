// src/components/steps/StepLineaServicio.jsx
import { useCallback, useMemo } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useStepWizard } from '../../context/StepWizardContext';
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
  const { goPrev } = useStepWizard();
  const { orden, handleChangeLinea, handleAgregarLinea, handleRemoveLinea } =
    useOrdenServicioContext();

  const linea = useMemo(() => orden.lineas[index], [orden.lineas, index]);

  const gridTemplate = useMemo(
    () =>
      linea?.categoria === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    [linea?.categoria]
  );

  const handleFieldChange = useCallback(
    (field, value) => {
      handleChangeLinea(index, field, value);
    },
    [index, handleChangeLinea]
  );

  const handleAddLinea = useCallback(() => {
    if (!linea?.tipoTrabajo) {
      alert(
        '⚠️ Debes seleccionar un tipo de trabajo antes de agregar otra línea.'
      );
      return;
    }
    handleAgregarLinea();
  }, [linea?.tipoTrabajo, handleAgregarLinea]);

  const handleDeleteLinea = useCallback(async () => {
    // 👈 Paso 1: retroceder antes de eliminar
    goPrev();
    await new Promise((r) => setTimeout(r, 650));

    // 👇 Paso 2: eliminar la línea
    handleRemoveLinea(index);
  }, [index, goPrev, handleRemoveLinea]);

  if (!linea) {
    return (
      <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
        (Esta línea fue eliminada)
      </p>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <SchemaForm
        key={index}
        values={linea}
        onChange={handleFieldChange}
        fields={fields}
        showDescriptions={false}
        gridTemplateColumns={gridTemplate}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1.2rem',
        }}
      >
        <button
          type="button"
          onClick={handleAddLinea}
          style={{
            background: '#f0f0f0',
            color: '#333',
            border: '1px solid #ccc',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ➕ Agregar nueva línea
        </button>

        <button
          type="button"
          onClick={handleDeleteLinea}
          style={{
            background: '#ff4d4d',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          🗑️ Eliminar línea
        </button>
      </div>
    </div>
  );
}
