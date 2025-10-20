import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { buildOrdenServicioFields } from '../../forms/ordenServicioFormSchema';
import { useOrdenServicioForm } from '../../hooks/useOrdenServicioForm';
import { SchemaForm } from './SchemaForm';

export function StepOrdenServicio() {
  const { orden, handleChangeLinea, handleAgregarLinea } =
    useOrdenServicioContext();

  const linea = orden.lineas[0] || createLineaServicio();

  const form = useOrdenServicioForm({ linea, handleChangeLinea });
  const fields = buildOrdenServicioFields({ linea });

  return (
    <div>
      <SchemaForm
        values={linea}
        onChange={(field, value) => {
          form.handleChangeLinea(0, field, value);
        }}
        fields={fields}
        gridTemplateColumns={form.gridTemplate}
        showDescriptions={false}
      />

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleAgregarLinea}
          style={{
            background: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + Agregar línea de servicio
        </button>
      </div>
    </div>
  );
}
