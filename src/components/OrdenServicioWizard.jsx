// components/OrdenServicioWizard.jsx
import { getSteps } from '../config/stepsConfig';
import { useOrdenServicioContext } from '../context/OrdenServicioContext';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';
import { StepWizardCore } from './StepWizardCore';

export function OrdenServicioWizard({ tecnicoId }) {
  const { orden } = useOrdenServicioContext();

  // pasamos tecnicoId al hook
  const { ids, handleStepSubmit, handleFinalSubmit } = useOrdenServicioWizard({
    tecnicoId,
  });

  const steps = getSteps(orden);

  return (
    <StepWizardCore
      steps={steps}
      // enviamos una función que reciba currentStep y la derive al hook con la orden actual
      onStepSubmit={(currentStep) => handleStepSubmit(currentStep, orden)}
      onFinalSubmit={() => handleFinalSubmit(orden)}
      getNextLabel={(currentStep) => {
        if (currentStep.id === 'cliente') {
          return orden?.cliente?._id ? 'Siguiente' : 'Crear Cliente';
        }
        if (currentStep.id === 'equipo') {
          return orden?.equipo?._id ? 'Siguiente' : 'Registrar Equipo';
        }
        return 'Siguiente';
      }}
      getSubmitLabel={() => 'Finalizar Orden'}
    />
  );
}
