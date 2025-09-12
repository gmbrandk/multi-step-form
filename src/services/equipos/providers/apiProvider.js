// services/equipos/providers/apiProvider.js
import axios from 'axios';
const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearEquipo: async (equipoData) => {
    try {
      const res = await axios.post(`${baseURL}/equipos`, equipoData, {
        withCredentials: true,
      });
      return res.data; // { success, ok, message, details.equipo }
    } catch (error) {
      console.error('[❌ apiProvider] Error en crearEquipo:', error);
      throw (
        error.response?.data || { mensaje: 'Error desconocido al crear equipo' }
      );
    }
  },
};
