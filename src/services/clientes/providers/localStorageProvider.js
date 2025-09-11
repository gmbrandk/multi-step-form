// @services/clientes/providers/localStorageProvider.js
import { normalizedId } from '../../../utils/formatters';

const LOCAL_STORAGE_KEY = 'clientes_testing';

const simularLatencia = (res) =>
  new Promise((resolve) => setTimeout(() => resolve(res), 300));

const obtenerData = () =>
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

const guardarData = (data) =>
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

export const localStorageProvider = {
  crearCliente: async (clienteData) => {
    const data = obtenerData();

    const nuevoCliente = {
      ...clienteData,
      _id: normalizedId(clienteData),
      fechaRegistro: new Date().toISOString(),
      estado: 'activo',
      calificacion: 'regular',
      isActivo: true,
    };

    data.push(nuevoCliente);
    guardarData(data);

    return simularLatencia({
      success: true,
      ok: true,
      message: 'Cliente creado correctamente',
      mensaje: 'Cliente creado correctamente',
      details: { cliente: nuevoCliente },
    });
  },
};
