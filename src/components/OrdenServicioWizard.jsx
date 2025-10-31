import { useMemo } from 'react';
import { getSteps } from '../config/stepsConfig';
import { useOrdenServicioContext } from '../context/OrdenServicioContext';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';
import { StepWizardCore } from './StepWizardCore';

export function OrdenServicioWizard({ tecnicoId }) {
  const { orden } = useOrdenServicioContext();
  const { ids, handleStepSubmit, handleFinalSubmit } = useOrdenServicioWizard({
    tecnicoId,
  });

  const steps = useMemo(() => {
    console.groupCollapsed(
      '%c[Wizard] ♻️ Recalculando steps...',
      'color:#3498db;font-weight:bold'
    );
    console.log('🧩 orden.lineas.length:', orden.lineas?.length);
    const newSteps = getSteps(orden);
    console.table(newSteps.map((s, i) => ({ i, id: s.id, title: s.title })));
    console.groupEnd();
    return newSteps;
  }, [orden.lineas?.length, orden.equipo?.especificaciones]);

  // 🔔 Callbacks globales para feedback visual
  const handleError = (msg) => {
    console.error('[Wizard Error]', msg);
    // 👉 Cuando enchufes SweetAlert2 o Toast:
    // Swal.fire({ icon: 'error', title: 'Error', text: msg });
    // toast.error(msg);
  };

  const handleSuccess = (msg) => {
    console.log('[Wizard Success]', msg);
    // 👉 Ejemplo:
    // Swal.fire({ icon: 'success', title: 'Éxito', text: msg });
    // toast.success(msg);
  };

  return (
    <StepWizardCore
      steps={steps}
      onStepSubmit={(currentStep) => handleStepSubmit(currentStep, orden)}
      onFinalSubmit={() => handleFinalSubmit(orden)}
      getNextLabel={(currentStep) => {
        if (currentStep.id === 'cliente') {
          return orden?.cliente?._id ? 'Siguiente' : 'Crear Cliente';
        }
        if (currentStep.id === 'equipo') {
          if (!orden?.equipo?._id) {
            return orden?.equipo?.especificaciones ? 'Agregar' : 'Crear Equipo';
          }
          return orden?.equipo?.especificaciones
            ? 'Agregar especificaciones'
            : 'Siguiente';
        }
        if (currentStep.id === 'ficha-tecnica') {
          return 'Registrar Equipo';
        }
        return 'Siguiente';
      }}
      getSubmitLabel={() => 'Finalizar Orden'}
      onError={handleError}
      onSuccess={handleSuccess}
    />
  );
}
