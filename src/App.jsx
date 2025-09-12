// App.jsx
import { OrdenServicioWizard } from './components/OrdenServicioWizard';
import { OrdenServicioProvider } from './context/OrdenServicioContext';
import { baseOrden } from './domain/constants';
import { generarOrdenServicioMock } from './utils/mockOrdenServicio';

export default function App() {
  return (
    <OrdenServicioProvider
      defaults={baseOrden}
      initialValues={generarOrdenServicioMock()}
    >
      <OrdenServicioWizard />
    </OrdenServicioProvider>
  );
}
