// src/hooks/useOrdenServicioWizard.js
import { useReducer } from 'react';
import { getClienteService } from '../services/clienteService';
import { getEquipoService } from '../services/equipoService';
import { getOrdenServicioService } from '../services/ordenServicioService';

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
      return { ...state, ordenId: action.payload };
    case 'RESET_CLIENTE':
    case 'RESET_ALL':
      return { clienteId: null, equipoId: null, ordenId: null };
    default:
      return state;
  }
}

const logger = {
  log: (...args) =>
    process.env.NODE_ENV === 'development' && console.log(...args),
  error: (...args) => console.error(...args),
};

export function useOrdenServicioWizard({ tecnicoId, onError, onSuccess } = {}) {
  const [ids, dispatch] = useReducer(idsReducer, initialIds);

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

  const resetClienteId = () => {
    logger.log('[Wizard] Reset cliente/equipo/orden');
    dispatch({ type: 'RESET_CLIENTE' });
  };

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
        logger.log('👤 Cliente detectado (actualizando ids):', dataId);
        dispatch({ type: 'SET_CLIENTE', payload: dataId });
        return { success: true };
      }

      logger.log('🆕 Creando nuevo cliente...', data);
      const res = await getClienteService().crearCliente(data);
      if (res.success && res.details?.cliente?._id) {
        const nuevoId = res.details.cliente._id;
        dispatch({ type: 'SET_CLIENTE', payload: nuevoId });
        return { success: true };
      } else {
        onError?.(res.message);
        return { success: false, message: res.message };
      }
    }

    // === EQUIPO ===
    if (currentStep.id === 'equipo') {
      const clienteCheck = validateIds(['clienteId']);
      if (!clienteCheck.success) return clienteCheck;

      if (orden.equipo?._id) {
        dispatch({ type: 'SET_EQUIPO', payload: orden.equipo._id });
        return { success: true };
      }

      return crearEquipo(orden.equipo);
    }

    // === FICHA TÉCNICA ===
    if (currentStep.id === 'ficha-tecnica') {
      const clienteCheck = validateIds(['clienteId']);
      if (!clienteCheck.success) return clienteCheck;

      return crearEquipo(orden.equipo, {
        fichaTecnicaManual: orden.fichaTecnica,
      });
    }

    return { success: true };
  };

  // --- SUBMIT FINAL ---
  const handleFinalSubmit = async (orden) => {
    console.log('🚀 Submitting Orden de Servicio final...');
    console.log('[Wizard] IDs finales:', ids);
    console.log('[Wizard] Orden final:', orden);

    const idCheck = validateIds(['clienteId', 'equipoId']);
    if (!idCheck.success) {
      onError?.(idCheck.message);
      return idCheck;
    }

    // 🧩 Validar líneas de servicio antes de construir el payload
    const lineas = orden.lineas || [];
    if (lineas.length === 0 && !orden.tipoTrabajo) {
      const msg = 'Debe completar al menos una línea de servicio.';
      console.error(msg);
      onError?.(msg);
      return { success: false, message: msg };
    }

    const validTipoTrabajoIds = [
      '68a74570f2ab41918da7f937',
      '68afd6a2c19b8c72a13decb0',
      '68dc9ac76162927555649baa',
      '68e335329e1eff2fcb38b733',
    ];

    for (const [i, linea] of lineas.entries()) {
      if (
        !linea.tipoTrabajo ||
        !validTipoTrabajoIds.includes(linea.tipoTrabajo)
      ) {
        const msg = `El tipo de trabajo en la línea ${i + 1} no es válido.`;
        console.error(msg);
        onError?.(msg);
        return { success: false, message: msg };
      }
    }

    const osService = getOrdenServicioService();
    const payload = osService.buildPayload({ ids, orden, tecnicoId });

    console.log('[handleFinalSubmit] Payload enviado:', payload);

    const res = await osService.crearOrdenServicio(payload);

    if (res.success && res.details?.orden?._id) {
      console.log('✅ Orden de servicio creada:', res.details.orden);
      dispatch({ type: 'SET_ORDEN', payload: res.details.orden._id });
      onSuccess?.('Orden de servicio creada con éxito.');
      return { success: true, details: res.details };
    } else {
      console.error('❌ Error creando orden de servicio:', res.message);
      onError?.(res.message || 'Error creando orden de servicio.');
      return {
        success: false,
        message: res.message || 'Error creando orden de servicio.',
      };
    }
  };

  return { ids, handleStepSubmit, handleFinalSubmit, resetClienteId };
}
