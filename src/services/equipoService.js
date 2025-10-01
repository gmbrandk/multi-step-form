// services/equipoService.js
let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarEquipoService = (
  provider,
  nombre = 'anónimo',
  tipo = 'desconocido'
) => {
  if (_inicializado) {
    console.warn(
      '[equipoService] Ya fue inicializado, ignorando reinicialización.'
    );
    return;
  }
  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;
};

export const getEquipoService = () => {
  if (!_inicializado || !_provider) {
    throw new Error('[equipoService] No ha sido inicializado.');
  }

  return {
    // 🔹 Llamada pura
    crearEquipo: (data) => _provider.crearEquipo(data),

    // 🔹 Construcción de payload
    buildPayload: ({ equipo, clienteId, fichaTecnica }) => {
      return {
        ...equipo,
        clienteActual: clienteId,
        ...(fichaTecnica ? { fichaTecnicaManual: fichaTecnica } : {}),
      };
    },

    // 🔹 Info del provider
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};

export const estaInicializadoEquipoService = () => _inicializado;
