import { Step1 } from './forms/Step1';
import { Step2 } from './forms/Step2';
import { Step3 } from './forms/Step3';
import { StepFichaTecnica } from './forms/StepFichaTecnica';
import { StepLineaServicio } from './forms/StepLineaServicio';

const COMPONENT_MAP = {
  Step1,
  Step2,
  Step3,
  StepFichaTecnica,
  StepLineaServicio,
};

export function StepRenderer({ component, values, onChange, ...rest }) {
  const Comp =
    COMPONENT_MAP[component] ||
    (() => <p>⚠️ No existe el componente {component}</p>);
  return <Comp values={values} onChange={onChange} {...rest} />;
}
