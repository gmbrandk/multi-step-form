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
      onStepSubmit={handleStepSubmit(ids, orden)}
      onFinalSubmit={() => handleFinalSubmit(ids, orden)}
    />
  );
}
