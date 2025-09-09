// services/ordenServicioService.js
const fakeRequest = (endpoint, body) =>
  new Promise((resolve) => {
    console.log(`📡 Simulación POST ${endpoint}`, body);
    setTimeout(() => {
      const fakeId = Math.random().toString(36).substring(2, 10);
      resolve({ _id: fakeId });
    }, 500);
  });

export const createCliente = (data) => fakeRequest('/clientes', data);
export const createEquipo = (data) => fakeRequest('/equipos', data);
export const createOrdenServicio = (data) =>
  fakeRequest('/ordenes-servicio', data);

export const finalizeOrdenServicio = (ids, orden) =>
  fakeRequest('/ordenes-servicio/final', {
    representanteId: ids.clienteId,
    equipoId: ids.equipoId,
    lineasServicio: orden.lineas || [],
    tecnico: '681b7df58ea5aadc2aa6f420',
    total: Number(orden.total || 0),
    fechaIngreso: orden.fechaIngreso || new Date().toISOString(),
    diagnosticoCliente: orden.diagnostico || '',
    observaciones: orden.observaciones || '',
  });
