// @services/clientes/providers/apiProvider.js
import axios from 'axios';
const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearCliente: async (clienteData) => {
    try {
      const res = await axios.post(`${baseURL}/clientes`, clienteData, {
        withCredentials: true,
      });
      return res.data; // 👈 ya viene con { success, ok, message, details.cliente }
    } catch (error) {
      console.error('[❌ apiProvider] Error en crearCliente:', error);
      throw (
        error.response?.data || {
          mensaje: 'Error desconocido al crear cliente',
        }
      );
    }
  },
};
