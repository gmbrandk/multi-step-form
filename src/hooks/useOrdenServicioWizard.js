// src/hooks/useOrdenServicioWizard.js
import { useReducer } from 'react';
import { getClienteService } from '../services/clienteService';
import { getEquipoService } from '../services/equipoService';
import { getOrdenServicioService } from '../services/ordenServicioService';

// --- Reducer ---
const initialIds = { clienteId: null, equipoId: null, ordenId: null };

function idsReducer(state, action) {
  switch (action.type) {
    case 'SET_CLIENTE':
      return { clienteId: action.payload, equipoId: null, ordenId: null };

    case 'SET_EQUIPO':
      if (!state.clienteId) {
        logger.error('No se puede setear equipo sin cliente');
        return state;
      }
      return { ...state, equipoId: action.payload, ordenId: null };

    case 'SET_ORDEN':
      if (!state.clienteId || !state.equipoId) {
        logger.error('No se puede setear orden sin cliente y equipo');
        return state;
      }
      return { ...state, ordenId: action.payload }; // ✅ ahora espera un string

    case 'RESET_CLIENTE':
    case 'RESET_ALL':
      return { clienteId: null, equipoId: null, ordenId: null };

    default:
      return state;
  }
}

// --- Logger helper (puedes adaptarlo a tu logger real) ---
const logger = {
  log: (...args) =>
    process.env.NODE_ENV === 'development' && console.log(...args),
  error: (...args) => console.error(...args),
};

// --- Hook principal ---
export function useOrdenServicioWizard({ tecnicoId } = {}) {
  const [ids, dispatch] = useReducer(idsReducer, initialIds);

  // 🔐 Validador centralizado
  const validateIds = (required = []) => {
    for (const key of required) {
      if (!ids[key]) {
        logger.error(`Falta ${key}`);
        return {
          success: false,
          message: `Debe completar ${key} antes de continuar.`,
        };
      }
    }
    return { success: true };
  };

  // 🔄 Reset cliente/equipo/orden
  const resetClienteId = () => {
    logger.log('[Wizard] Reset cliente/equipo/orden');
    dispatch({ type: 'RESET_CLIENTE' });
  };

  // --- Helper: crear equipo ---
  const crearEquipo = async (equipoData, extra = {}) => {
    const res = await getEquipoService().crearEquipo({
      ...equipoData,
      clienteActual: ids.clienteId,
      ...extra,
    });

    if (res.success && res.details?.equipo?._id) {
      const nuevo = res.details.equipo;
      logger.log('✅ Equipo creado:', nuevo);
      dispatch({ type: 'SET_EQUIPO', payload: nuevo._id });
      return { success: true };
    } else {
      logger.error('❌ Error creando equipo:', res.message);
      return {
        success: false,
        message: res.message || 'Error creando equipo.',
      };
    }
  };

  // Maneja cada paso del wizard
  const handleStepSubmit = async (currentStep, orden) => {
    logger.log(`[Wizard] Submitting step: ${currentStep.id}`);
    logger.log('[Wizard] Orden actual:', orden);
    logger.log('[Wizard] IDs actuales:', ids);

    const data = orden[currentStep.id] || {};

    // === CLIENTE ===
    if (currentStep.id === 'cliente') {
      const dataId = data?._id;

      if (dataId) {
        if (ids.clienteId && ids.clienteId === dataId) {
          logger.log('👤 Cliente ya procesado y coincide:', dataId);
          return { success: true };
        }
        if (typeof dataId !== 'string') {
          logger.error('ClienteId inválido recibido');
          return {
            success: false,
            message: 'Error interno: clienteId inválido.',
          };
        }
        logger.log('👤 Cliente detectado (actualizando ids):', dataId);
        dispatch({ type: 'SET_CLIENTE', payload: dataId });
        return { success: true };
      }

      if (ids.clienteId) {
        logger.log('⚡ Cliente ya procesado → skip', ids.clienteId);
        return { success: true };
      }

      logger.log('🆕 Creando nuevo cliente...', data);
      const res = await getClienteService().crearCliente(data);

      if (res.success && res.details?.cliente?._id) {
        const nuevoId = res.details.cliente._id;
        logger.log('✅ Cliente creado:', nuevoId);
        dispatch({ type: 'SET_CLIENTE', payload: nuevoId });
        return { success: true };
      } else {
        logger.error('❌ Error creando cliente:', res.message);
        return {
          success: false,
          message: res.message || 'Error creando cliente.',
        };
      }
    }

    // === EQUIPO ===
    if (currentStep.id === 'equipo') {
      const clienteCheck = validateIds(['clienteId']);
      if (!clienteCheck.success) return clienteCheck;

      if (orden.equipo?._id) {
        logger.log('💻 Equipo existente detectado:', orden.equipo._id);
        dispatch({ type: 'SET_EQUIPO', payload: orden.equipo._id });
        return { success: true };
      }

      if (orden.equipo?.especificaciones) {
        logger.log('📝 Agregar especificaciones sin crear equipo todavía');
        return { success: true };
      }

      return crearEquipo(orden.equipo);
    }

    // === FICHA TÉCNICA ===
    if (currentStep.id === 'ficha-tecnica') {
      const clienteCheck = validateIds(['clienteId']);
      if (!clienteCheck.success) return clienteCheck;

      logger.log('🛠️ Creando equipo con ficha técnica...');
      return crearEquipo(orden.equipo, {
        fichaTecnicaManual: orden.fichaTecnica,
      });
    }

    return { success: true };
  };

  // Submit final

  const handleFinalSubmit = async (orden) => {
    console.log('🚀 Submitting Orden de Servicio final...');
    console.log('[Wizard] IDs finales:', ids);
    console.log('[Wizard] Orden final:', orden);

    // ✅ Validación crítica de IDs
    const idCheck = validateIds(['clienteId', 'equipoId']);
    if (!idCheck.success) return idCheck;

    // ✅ Validación de lineasServicio
    for (const [i, linea] of (orden.lineas || []).entries()) {
      if (!linea.tipoTrabajo) {
        console.error(`❌ Línea ${i + 1} sin tipoTrabajo válido`, linea);
        return {
          success: false,
          message: `Debe seleccionar un tipo de trabajo válido en la línea ${
            i + 1
          }.`,
        };
      }
    }

    const osService = getOrdenServicioService();

    // 🔹 El hook ya no arma el payload, lo pide al service
    const payload = osService.buildPayload({ ids, orden, tecnicoId });

    console.log('[handleFinalSubmit] Payload enviado:', payload);

    const res = await osService.crearOrdenServicio(payload);

    if (res.success && res.details?.orden?._id) {
      console.log('✅ Orden de servicio creada con éxito:', res.details.orden);

      // Reducer actualiza estado de IDs
      dispatch({
        type: 'SET_ORDEN',
        payload: res.details.orden._id,
      });

      return { success: true, details: res.details };
    } else {
      console.error('❌ Error creando orden de servicio:', res.message);
      return {
        success: false,
        message: res.message || 'Error creando orden de servicio.',
      };
    }
  };

  return { ids, handleStepSubmit, handleFinalSubmit, resetClienteId };
}
