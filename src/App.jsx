// App.jsx
import { useState } from 'react';
import { OrdenServicioWizard } from './components/OrdenServicioWizard';
import {
  OrdenServicioProvider,
  useOrdenServicioContext,
} from './context/OrdenServicioContext';
import { baseOrden } from './domain/constants';
import { localStorageProvider } from './services/clientes/providers/localStorageProvider';
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
      <button onClick={() => localStorageProvider.resetClientes()}>
        🧹 Limpiar Clientes Cache
      </button>
    </div>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);

  /* if (!usuario) {
    return <LoginForm onSuccess={(data) => setUsuario(data.usuario)} />;
  } */
  return (
    <OrdenServicioProvider defaults={baseOrden}>
      <MockButtons />
      <OrdenServicioWizard />
    </OrdenServicioProvider>
  );
}
