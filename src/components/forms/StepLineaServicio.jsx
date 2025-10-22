import { useCallback, useMemo } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useStepWizard } from '../../context/StepWizardContext';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo'; // <-- nuevo hook dinámico
import { SchemaForm } from './SchemaForm';

export function StepLineaServicio({ index }) {
  const { goPrev } = useStepWizard();
  const { orden, handleChangeLinea, handleAgregarLinea, handleRemoveLinea } =
    useOrdenServicioContext();

  const { tiposTrabajo, loading } = useTiposTrabajo(); // ← cargamos los tipos dinámicos
  const linea = useMemo(() => orden.lineas[index], [orden.lineas, index]);

  const gridTemplate = useMemo(
    () => (linea?.tipo === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
    [linea?.tipo]
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
    goPrev();
    await new Promise((r) => setTimeout(r, 650));
    handleRemoveLinea(index);
  }, [index, goPrev, handleRemoveLinea]);

  if (!linea) {
    return (
      <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
        (Esta línea fue eliminada)
      </p>
    );
  }

  if (loading) {
    return (
      <p style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
        Cargando tipos de trabajo...
      </p>
    );
  }

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
  // Campos dinámicos (tiposTrabajo viene del hook)
  const fields = [
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
      name: 'cantidad',
      type: 'number',
      label: { name: 'Cantidad', className: 'sr-only' },
      gridColumn: '1 / 2',
      defaultValue: 1,
      visibleWhen: (values) => values.tipo === 'producto',
    },
    {
      name: 'precioUnitario',
      type: 'number',
      label: { name: 'Precio unitario', className: 'sr-only' },
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

  // === Estilos inline que imitan a .msform .action-button ===
  const actionButtonStyle = {
    width: '100px',
    background: '#27ae60',
    fontWeight: 'bold',
    color: 'white',
    border: '0 none',
    borderRadius: '1px',
    cursor: 'pointer',
    padding: '10px',
    margin: '10px 5px',
    textDecoration: 'none',
    fontSize: '14px',
    fontFamily: 'montserrat, arial, verdana',
    transition: 'box-shadow 0.2s ease-in-out',
  };

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

      {/* 👇 Botones de agregar/eliminar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '1.2rem',
        }}
      >
        <button
          type="button"
          onClick={handleAddLinea}
          style={{
            ...actionButtonStyle,
            background: '#2980b9',
          }}
        >
          ➕ Agregar línea
        </button>

        <button
          type="button"
          onClick={handleDeleteLinea}
          style={{
            ...actionButtonStyle,
            background: '#c0392b',
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}
