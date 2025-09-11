// @config/proveedores.js (añades clientes igual que usuarios)
import { apiProvider as clientesApiProvider } from '../services/clientes/providers/apiProvider';
import { localStorageProvider as clientesLocalProvider } from '../services/clientes/providers/localStorageProvider';

export const mapaProveedoresClientes = {
  local: {
    instancia: clientesLocalProvider,
    nombre: 'Mock Local Clientes',
    tipo: 'mock',
  },
  api: {
    instancia: clientesApiProvider,
    nombre: 'API REST Clientes',
    tipo: 'api',
  },
};
