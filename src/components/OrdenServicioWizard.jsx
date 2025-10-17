import { getSteps } from '../config/stepsConfig';
import { useOrdenServicioContext } from '../context/OrdenServicioContext';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';
import { StepWizardCore } from './StepWizardCore';

export function OrdenServicioWizard({ tecnicoId }) {
  const { orden } = useOrdenServicioContext();
  const { ids, handleStepSubmit, handleFinalSubmit } = useOrdenServicioWizard({
    tecnicoId,
  });

  const steps = getSteps(orden);

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
