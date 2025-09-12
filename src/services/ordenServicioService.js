// services/ordenServicioService.js
let _provider = null;
let _proveedorNombre = 'no definido';
let _proveedorTipo = 'desconocido';
let _inicializado = false;

export const inicializarOrdenServicioService = (
  provider,
  nombre = 'anónimo',
  tipo = 'desconocido'
) => {
  if (_inicializado) {
    console.warn(
      '[ordenServicioService] Ya fue inicializado, ignorando reinicialización.'
    );
    return;
  }
  _provider = provider;
  _proveedorNombre = nombre;
  _proveedorTipo = tipo;
  _inicializado = true;
};

export const getOrdenServicioService = () => {
  if (!_inicializado || !_provider) {
    throw new Error('[ordenServicioService] No ha sido inicializado.');
  }
  return {
    crearOrdenServicio: (data) => _provider.crearOrdenServicio(data),
    finalizarOrdenServicio: (ids, orden) =>
      _provider.finalizarOrdenServicio(ids, orden),
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};

export const estaInicializadoOrdenServicioService = () => _inicializado;
