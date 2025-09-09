// components/OrdenServicioWizard.jsx
import { getSteps } from '../config/stepsConfig';
import { useOrdenServicioContext } from '../context/OrdenServicioContext';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';
import { StepWizardCore } from './StepWizardCore';

export function OrdenServicioWizard() {
  const { orden } = useOrdenServicioContext();
  const { ids, handleStepSubmit, handleFinalSubmit } = useOrdenServicioWizard();

  const steps = getSteps(orden);

  return (
    <StepWizardCore
      steps={steps}
      onStepSubmit={handleStepSubmit(ids, orden)}
      onFinalSubmit={() => handleFinalSubmit(ids, orden)}
    />
  );
}
