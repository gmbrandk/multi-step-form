// useLineaServicio.js
export function createLineaServicio(overrides = {}) {
  return {
    tipo: 'servicio', // default
    tipoTrabajo: '68afd6a2c19b8c72a13decb0',
    nombreTrabajo: '',
    cantidad: 1, // mínimo 1
    precioUnitario: 0,
    subTotal: 0,
    crearLinea: false,
    ...overrides,
  };
}
