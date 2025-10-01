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
    // 🔹 Llamadas puras al backend
    crearOrdenServicio: (payload) => _provider.crearOrdenServicio(payload),
    finalizarOrdenServicio: (ids, orden) =>
      _provider.finalizarOrdenServicio(ids, orden),

    // 🔹 Helpers de construcción de payloads
    buildPayload: ({ ids, orden, tecnicoId }) => {
      return {
        representanteId: ids.clienteId,
        equipoId: ids.equipoId,
        lineasServicio: (orden.lineas || []).map((l) => ({
          tipoTrabajo: l.tipoTrabajo,
          nombreTrabajo: l.nombreTrabajo,
          descripcion: l.descripcion,
          precioUnitario: l.precioUnitario,
          cantidad: l.cantidad,
        })),
        tecnico: orden.tecnico || tecnicoId,
        total: orden.total || 0,
        fechaIngreso: orden.fechaIngreso || new Date().toISOString(),
        diagnosticoCliente: orden.diagnosticoCliente || '',
        observaciones: orden.observaciones || '',
      };
    },

    // Info del provider (debugging)
    obtenerNombreProveedor: () => _proveedorNombre,
    obtenerTipoProveedor: () => _proveedorTipo,
  };
};

export const estaInicializadoOrdenServicioService = () => _inicializado;
