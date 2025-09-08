import MultiStepForm from './MultiStepForm';
import { OrdenServicioProvider } from './OrdenServicioContext';
export default function App() {
  return (
    <OrdenServicioProvider initialValues={{}}>
      <MultiStepForm />
    </OrdenServicioProvider>
  );
}
