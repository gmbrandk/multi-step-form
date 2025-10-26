import { useMemo, useState } from 'react';
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { buildOrdenServicioFields } from '../../forms/ordenServicioFormSchema';
import { useOrdenServicioForm } from '../../hooks/useOrdenServicioForm';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo';
import { SchemaForm } from './SchemaForm';

export function StepOrdenServicio() {
  const { orden, handleChangeLinea, handleAgregarLinea } =
    useOrdenServicioContext();
  const { tiposTrabajo, loading, error, refetch } = useTiposTrabajo();
  const linea = orden.lineas[0] || createLineaServicio();
  const form = useOrdenServicioForm({ linea, handleChangeLinea });

  // ===============================
  // ⚙️ Campos dinámicos con fallback
  // ===============================
  const fields = useMemo(
    () =>
      buildOrdenServicioFields({
        linea,
        tiposTrabajo,
        isFallback: loading || error,
        fallbackMessage: error
          ? '⚠️ No se pudo conectar con el servidor'
          : '⏳ Cargando tipos de trabajo...',
      }),
    [linea, tiposTrabajo, loading, error]
  );

  const [isHover, setIsHover] = useState(false);

  const actionButtonStyle = {
    width: '180px',
    background: '#2980b9',
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

  const actionButtonHover = {
    boxShadow: '0 0 0 2px white, 0 0 0 3px #2980b9',
  };

  const isFallback = loading || error;

  return (
    <div>
      <SchemaForm
        values={linea}
        onChange={(field, value) => form.handleChangeLinea(0, field, value)}
        fields={fields}
        gridTemplateColumns={form.gridTemplate}
        showDescriptions={false}
        isFallback={isFallback}
        fallbackMessage={
          error
            ? '⚠️ Error de conexión con el backend'
            : '⏳ Cargando datos del formulario...'
        }
        onRetry={refetch} // 👈 agregado
      />

      {/* 👇 Botón se oculta si está en modo fallback */}
      {!isFallback && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleAgregarLinea}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            style={{
              ...actionButtonStyle,
              background: '#2980b9',
              ...(isHover ? actionButtonHover : {}),
            }}
          >
            ➕ Agregar línea de servicio
          </button>
        </div>
      )}
    </div>
  );
}
