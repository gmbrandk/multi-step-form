import axios from 'axios';
const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearOrdenServicio: async (ordenData) => {
    try {
      const res = await axios.post(`${baseURL}/os`, ordenData, {
        withCredentials: true,
      });

      // 🔹 Caso éxito
      return {
        success: true,
        status: res.status,
        code: 'ORDEN_SERVICIO_CREADA',
        message: res.data.message || 'Orden de servicio creada con éxito',
        details: { orden: res.data.details?.orden },
      };
    } catch (error) {
      console.error(
        '[❌ ordenServicioApiProvider] Error en crearOrdenServicio:',
        error
      );

      // 🔹 Caso error uniforme
      const err = error.response?.data || {
        status: 500,
        code: 'UNKNOWN_ERROR',
        message: 'Error desconocido al crear orden de servicio',
        details: null,
      };

      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Error desconocido al crear orden de servicio',
        details: err.details || null,
      };
    }
  },
};
