// constants.js
import { createLineaServicio } from './createLineaServicio';

export const baseOrden = {
  fechaIngreso: '',
  diagnostico: '',
  observaciones: '',
  total: 0,
  crearLinea: false,
  lineas: [createLineaServicio()],
  createLineaServicio, // 👉 para inyección de dependencias
};
