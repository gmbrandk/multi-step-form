import MultiStepForm from './MultiStepForm';
import { OrdenServicioProvider } from './OrdenServicioContext';
import { baseOrden } from './constants';

export default function App() {
  return (
    <OrdenServicioProvider defaults={baseOrden}>
      <MultiStepForm />
    </OrdenServicioProvider>
  );
}
