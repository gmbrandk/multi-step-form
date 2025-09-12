import axios from 'axios';
const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearOrdenServicio: async (ordenData) => {
    try {
      const res = await axios.post(`${baseURL}/os`, ordenData, {
        withCredentials: true,
      });
      return res.data; // { success, ok, message, details.orden }
    } catch (error) {
      console.error(
        '[❌ ordenServicioApiProvider] Error en crearOrdenServicio:',
        error
      );
      throw (
        error.response?.data || {
          mensaje: 'Error desconocido al crear orden de servicio',
        }
      );
    }
  },
};
