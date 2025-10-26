import { useCallback, useMemo } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useStepWizard } from '../../context/StepWizardContext';
import { buildOrdenServicioFields } from '../../forms/ordenServicioFormSchema';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo';
import { SchemaForm } from './SchemaForm';

export function StepLineaServicio({ index }) {
  const { goPrev } = useStepWizard();
  const { orden, handleChangeLinea, handleAgregarLinea, handleRemoveLinea } =
    useOrdenServicioContext();

  const { tiposTrabajo, loading, error, refetch } = useTiposTrabajo();
  const linea = useMemo(() => orden.lineas[index], [orden.lineas, index]);

  const gridTemplate = useMemo(
    () => (linea?.tipo === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
    [linea?.tipo]
  );

  const handleFieldChange = useCallback(
    (field, value) => handleChangeLinea(index, field, value),
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

  // ===============================
  // ⚙️ Fallback profesional (loading/error)
  // ===============================
  const isFallback = loading || error;
  const fallbackMessage = error
    ? '⚠️ Error de conexión con el backend'
    : '⏳ Cargando tipos de trabajo...';

  // ===============================
  // 🧩 Campos dinámicos
  // ===============================
  const fields = useMemo(
    () =>
      buildOrdenServicioFields({
        linea,
        tiposTrabajo,
        isFallback,
        fallbackMessage,
      }),
    [linea, tiposTrabajo, isFallback, fallbackMessage]
  );

  // === Botones ===
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
    <div>
      <SchemaForm
        key={index}
        values={linea}
        onChange={handleFieldChange}
        fields={fields}
        showDescriptions={false}
        gridTemplateColumns={gridTemplate}
        isFallback={isFallback}
        fallbackMessage={fallbackMessage}
        onRetry={refetch}
      />

      {/* 👇 Botones de agregar/eliminar (ocultos durante fallback) */}
      {!isFallback && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
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
      )}
    </div>
  );
}
