// App.jsx
import { OrdenServicioWizard } from './components/OrdenServicioWizard';
import {
  OrdenServicioProvider,
  useOrdenServicioContext,
} from './context/OrdenServicioContext';
import { baseOrden } from './domain/constants';
import {
  generarClienteMock,
  generarEquipoMock,
  generarOrdenMock,
} from './utils/mockOrdenServicio';

function MockButtons() {
  const { setOrden } = useOrdenServicioContext();

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() =>
          setOrden((prev) => ({ ...prev, cliente: generarClienteMock() }))
        }
      >
        🧑 Mock Cliente
      </button>
      <button
        onClick={() =>
          setOrden((prev) => ({ ...prev, equipo: generarEquipoMock() }))
        }
      >
        💻 Mock Equipo
      </button>
      <button
        onClick={() => setOrden((prev) => ({ ...prev, ...generarOrdenMock() }))}
      >
        🛠️ Mock Orden
      </button>
    </div>
  );
}

export default function App() {
  return (
    <OrdenServicioProvider defaults={baseOrden}>
      <MockButtons />
      <OrdenServicioWizard />
    </OrdenServicioProvider>
  );
}
