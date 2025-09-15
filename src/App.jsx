import { useState, useEffect } from 'react';
import { OrdenServicioWizard } from './components/OrdenServicioWizard';
import { LoginForm } from './components/forms/LoginForm';
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
  const [loading, setLoading] = useState(true);

  // Verificar sesión al montar
  useEffect(() => {
    const url = 'http://localhost:5000/api/auth/me';
    console.log('[App] Verificando sesión con backend:', url);

    fetch(url, { credentials: 'include' })
      .then(async (res) => {
        console.log('[App] Response status:', res.status);
        const data = await res.json();
        console.log('[App] Datos recibidos del backend:', data);

        if (data.success && data.usuario) {
          setUsuario(data.usuario);
          console.log('[App] Usuario seteado en estado:', data.usuario);
        } else {
          console.log('[App] No hay usuario activo en sesión');
        }
      })
      .catch((err) => {
        console.error('[App] Error al verificar sesión:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🚧 Mientras se verifica la sesión
  if (loading) return <div>Cargando sesión...</div>;

  // 🚧 Si no hay usuario logueado
  if (!usuario) {
    return (
      <LoginForm
        onSuccess={(data) => {
          console.log('[LoginForm] Login exitoso, datos recibidos:', data);
          setUsuario(data.usuario);
          console.log('[LoginForm] Usuario seteado en estado:', data.usuario);
        }}
      />
    );
  }

  // ✅ Solo ahora usuario ya existe
  const tecnicoId = usuario._id;

  return (
    <OrdenServicioProvider defaults={baseOrden}>
      <MockButtons />
      {/* Pasamos tecnicoId al wizard */}
      <OrdenServicioWizard tecnicoId={tecnicoId} />
    </OrdenServicioProvider>
  );
}
