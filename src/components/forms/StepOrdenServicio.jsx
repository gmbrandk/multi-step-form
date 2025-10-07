// StepOrdenServicio.jsx
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { createLineaServicio } from '../../domain/createLineaServicio';
import { buildOrdenServicioFields } from '../../forms/ordenServicioFormSchema';
import { useOrdenServicioForm } from '../../hooks/useOrdenServicioForm';
import { SchemaForm } from './SchemaForm';

export function StepOrdenServicio() {
  const { orden, handleChangeLinea } = useOrdenServicioContext();

  const linea = orden.lineas[0] || createLineaServicio();

  const form = useOrdenServicioForm({ linea, handleChangeLinea });
  const fields = buildOrdenServicioFields({ linea });

  return (
    <SchemaForm
      values={linea}
      onChange={(field, value) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🔄 StepOrdenServicio.onChange [${field}] =`, value);
        }
        form.handleChangeLinea(0, field, value);
      }}
      fields={fields}
      gridTemplateColumns={form.gridTemplate}
      showDescriptions={false}
    />
  );
}
