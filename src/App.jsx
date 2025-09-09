// App.jsx
import { OrdenServicioWizard } from './components/OrdenServicioWizard';
import { OrdenServicioProvider } from './context/OrdenServicioContext';
import { baseOrden } from './domain/constants';

export default function App() {
  return (
    <OrdenServicioProvider defaults={baseOrden}>
      <OrdenServicioWizard />
    </OrdenServicioProvider>
  );
}
