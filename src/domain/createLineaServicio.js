// useLineaServicio.js
export function createLineaServicio(overrides = {}) {
  return {
    categoria: 'servicio', // default
    nombreTrabajo: '',
    cantidad: 1, // mínimo 1
    precioUnitario: 0,
    subTotal: 0,
    crearLinea: false,
    ...overrides,
  };
}
