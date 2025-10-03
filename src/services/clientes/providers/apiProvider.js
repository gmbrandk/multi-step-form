// src/services/clientes/providers/apiProvider.js
import axios from 'axios';
const baseURL = 'http://localhost:5000/api';

export const apiProvider = {
  crearCliente: async (clienteData) => {
    try {
      const res = await axios.post(`${baseURL}/clientes`, clienteData, {
        withCredentials: true,
      });

      // 🔹 Caso éxito
      return {
        success: true,
        status: res.status,
        code: 'CLIENTE_CREADO',
        message: res.data.message || 'Cliente creado con éxito',
        details: { cliente: res.data.details?.cliente },
      };
    } catch (error) {
      console.error('[❌ apiProvider] Error en crearCliente:', error);

      // 🔹 Caso error uniforme
      const err = error.response?.data || {
        status: 500,
        code: 'UNKNOWN_ERROR',
        message: 'Error desconocido al crear cliente',
        details: null,
      };

      return {
        success: false,
        status: err.status || 500,
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'Error desconocido al crear cliente',
        details: err.details || null,
      };
    }
  },
  generarEmails: async ({ nombres, apellidos }) => {
    try {
      const res = await axios.post(
        `${baseURL}/clientes/generar-emails`,
        {
          nombres,
          apellidos,
        },
        { withCredentials: true }
      );

      return {
        success: true,
        status: res.status,
        code: 'EMAILS_GENERADOS',
        message: res.data.message || 'Sugerencias obtenidas',
        details: res.data.details || [],
      };
    } catch (error) {
      const err = error.response?.data || {
        status: 500,
        code: 'UNKNOWN_ERROR',
        message: 'Error desconocido al generar emails',
        details: null,
      };
      return {
        success: false,
        status: err.status,
        code: err.code,
        message: err.message,
        details: err.details,
      };
    }
  },
};
