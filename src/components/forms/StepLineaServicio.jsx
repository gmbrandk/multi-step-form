// src/components/forms/StepLineaServicio.jsx
import { useCallback, useEffect, useMemo } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { useStepWizard } from '../../context/StepWizardContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { buildLineaServicioFields } from '../../forms/lineaServicioFormSchema';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo';
import { SchemaForm } from './SchemaForm'; // 🚫 FallbackPanel eliminado

export function StepLineaServicio({ index }) {
  const { goPrev, goNext } = useStepWizard();
  const {
    orden,
    handleChangeLinea,
    handleAgregarLinea,
    handleRemoveLinea,
    isLineaBloqueada,
    bloquearLinea,
  } = useOrdenServicioContext();

  const { tiposTrabajo, loading, error, refetch } = useTiposTrabajo();

  const linea = orden.lineas?.[index] || createLineaServicio();
  const safeLinea = { tipo: 'servicio', ...linea };

  const esUltimaLinea = index === orden.lineas.length - 1;
  const bloqueado =
    index < orden.lineas.length - 1 ? true : isLineaBloqueada(index);

  useEffect(() => {
    console.groupCollapsed(
      `%c[StepLineaServicio index=${index} → Estado botón agregar]`,
      'color:#8e44ad;font-weight:bold'
    );
    console.log('🧩 Línea actual:', safeLinea);
    console.log('📊 Total de líneas:', orden.lineas.length);
    console.log('🧩 Es última línea:', esUltimaLinea);
    console.log(
      '🚦 Estado del botón agregar:',
      bloqueado ? '🔒 BLOQUEADO' : '🟢 HABILITADO'
    );
    console.groupEnd();
  }, [bloqueado, safeLinea, index, esUltimaLinea, orden.lineas.length]);

  const handleFieldChange = useCallback(
    (field, value) => {
      if (field === 'tipo') {
        handleChangeLinea(index, 'tipoTrabajo', '');
      }
      handleChangeLinea(index, field, value);
    },
    [index, handleChangeLinea]
  );

  const handleAddLinea = useCallback(() => {
    if (bloqueado) {
      console.warn(`⚠️ Botón bloqueado, acción ignorada (index ${index}).`);
      return;
    }

    if (!safeLinea.tipoTrabajo) {
      alert(
        '⚠️ Debes seleccionar un tipo de trabajo antes de agregar otra línea.'
      );
      return;
    }

    handleAgregarLinea();
    bloquearLinea(index, true);

    setTimeout(() => {
      goNext();
    }, 100);
  }, [
    safeLinea.tipoTrabajo,
    handleAgregarLinea,
    bloquearLinea,
    goNext,
    index,
    bloqueado,
  ]);

  const handleDeleteLinea = useCallback(async () => {
    goPrev();
    await new Promise((r) => setTimeout(r, 650));
    handleRemoveLinea(index);
  }, [index, goPrev, handleRemoveLinea]);

  const isFallback = loading || error;
  const fallbackMessage = error
    ? '⚠️ Error de conexión con el backend'
    : '⏳ Cargando tipos de trabajo...';

  const fields = useMemo(
    () =>
      buildLineaServicioFields({
        linea,
        tiposTrabajo,
        isFallback,
        fallbackMessage,
      }),
    [linea, tiposTrabajo, isFallback, fallbackMessage]
  );

  const gridTemplate = useMemo(
    () => (safeLinea.tipo === 'servicio' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
    [safeLinea.tipo]
  );

  const actionButtonStyle = {
    width: '100px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    padding: '10px',
    margin: '10px 5px',
    fontSize: '14px',
    fontFamily: 'montserrat, arial, verdana',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  console.log(
    `[Render StepLineaServicio index=${index}] bloqueado=${bloqueado} tipo=${
      safeLinea.tipo || 'N/A'
    }`
  );

  if (!linea) {
    return (
      <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
        (Esta línea fue eliminada)
      </p>
    );
  }

  // ✅ Ya no hay FallbackPanel — el shimmer de SchemaForm cubre el estado de carga/error
  return (
    <div>
      <SchemaForm
        key={index}
        values={safeLinea}
        onChange={handleFieldChange}
        fields={fields}
        showDescriptions={false}
        gridTemplateColumns={gridTemplate}
        error={error}
        isFallback={isFallback}
        fallbackMessage={fallbackMessage}
        onRetry={refetch}
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleAddLinea}
          disabled={bloqueado}
          style={{
            ...actionButtonStyle,
            background: bloqueado ? '#95a5a6' : '#2980b9',
            cursor: bloqueado ? 'not-allowed' : 'pointer',
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
            cursor: 'pointer',
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}
