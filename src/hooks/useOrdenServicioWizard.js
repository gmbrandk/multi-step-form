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
        console.error('❌ No se puede setear equipo sin cliente');
        return state;
      }
      return { ...state, equipoId: action.payload, ordenId: null };

    case 'SET_ORDEN':
      if (!state.clienteId || !state.equipoId) {
        console.error('❌ No se puede setear orden sin cliente y equipo');
        return state;
      }
      return { ...state, ordenId: action.payload };

    case 'RESET_CLIENTE':
      return { clienteId: null, equipoId: null, ordenId: null };

    case 'RESET_ALL':
      return { clienteId: null, equipoId: null, ordenId: null };

    default:
      return state;
  }
}

export function useOrdenServicioWizard({ tecnicoId } = {}) {
  const [ids, dispatch] = useReducer(idsReducer, initialIds);

  // 🔐 Validador centralizado
  const validateIds = (required = []) => {
    for (const key of required) {
      if (!ids[key]) {
        console.error(`❌ Falta ${key}`);
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
    console.log('[Wizard] 🔄 Reset cliente/equipo/orden');
    dispatch({ type: 'RESET_CLIENTE' });
  };

  // Maneja cada paso del wizard
  const handleStepSubmit = async (currentStep, orden) => {
    console.log(`[Wizard] Submitting step: ${currentStep.id}`);
    console.log('[Wizard] Orden actual:', orden);
    console.log('[Wizard] IDs actuales:', ids);

    const data = orden[currentStep.id] || {};

    // === CLIENTE ===
    if (currentStep.id === 'cliente') {
      const dataId = data?._id;

      if (dataId) {
        if (ids.clienteId && ids.clienteId === dataId) {
          console.log('👤 Cliente ya procesado y coincide:', dataId);
          return { success: true };
        }
        if (typeof dataId !== 'string') {
          console.error('❌ ClienteId inválido recibido');
          return {
            success: false,
            message: 'Error interno: clienteId inválido.',
          };
        }
        console.log(
          '👤 Cliente detectado en orden (actualizando ids):',
          dataId
        );
        dispatch({ type: 'SET_CLIENTE', payload: dataId });
        return { success: true };
      }

      if (ids.clienteId) {
        console.log('⚡ Cliente ya procesado → skip', ids.clienteId);
        return { success: true };
      }

      console.log('🆕 Creando nuevo cliente...', data);
      const res = await getClienteService().crearCliente(data);

      if (res.success && res.details?.cliente?._id) {
        const nuevoId = res.details.cliente._id;
        console.log('✅ Cliente creado:', nuevoId);
        dispatch({ type: 'SET_CLIENTE', payload: nuevoId });
        return { success: true };
      } else {
        console.error('❌ Error creando cliente:', res.message);
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
        console.log('💻 Equipo existente detectado:', orden.equipo._id);
        dispatch({ type: 'SET_EQUIPO', payload: orden.equipo._id });
        return { success: true };
      }

      if (orden.equipo?.especificaciones) {
        console.log('📝 Agregar especificaciones sin crear equipo todavía');
        return { success: true };
      }

      console.log('🆕 Creando nuevo equipo...', {
        ...orden.equipo,
        clienteActual: ids.clienteId,
      });

      const res = await getEquipoService().crearEquipo({
        ...orden.equipo,
        clienteActual: ids.clienteId,
      });

      if (res.success && res.details?.equipo?._id) {
        const nuevo = res.details.equipo;
        console.log('✅ Equipo creado:', nuevo);
        dispatch({ type: 'SET_EQUIPO', payload: nuevo._id });
        return { success: true };
      } else {
        console.error('❌ Error creando equipo:', res.message);
        return {
          success: false,
          message: res.message || 'Error creando equipo.',
        };
      }
    }

    // === FICHA TÉCNICA ===
    if (currentStep.id === 'ficha-tecnica') {
      const clienteCheck = validateIds(['clienteId']);
      if (!clienteCheck.success) return clienteCheck;

      console.log('🛠️ Creando equipo con ficha técnica...', {
        ...orden.equipo,
        fichaTecnicaManual: orden.fichaTecnica,
        clienteActual: ids.clienteId,
      });

      const res = await getEquipoService().crearEquipo({
        ...orden.equipo,
        fichaTecnicaManual: orden.fichaTecnica,
        clienteActual: ids.clienteId,
      });

      if (res.success && res.details?.equipo?._id) {
        const nuevo = res.details.equipo;
        console.log('✅ Equipo creado con ficha técnica:', nuevo);
        dispatch({ type: 'SET_EQUIPO', payload: nuevo._id });
        return { success: true };
      } else {
        console.error(
          '❌ Error creando equipo con ficha técnica:',
          res.message
        );
        return {
          success: false,
          message: res.message || 'Error creando equipo con ficha técnica.',
        };
      }
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

    const payload = {
      representanteId: ids.clienteId,
      equipoId: ids.equipoId,
      lineasServicio: (orden.lineas || []).map((l) => ({
        tipoTrabajo: l.tipoTrabajo,
        nombreTrabajo: l.nombreTrabajo,
        descripcion: l.descripcion,
        precioUnitario: l.precioUnitario,
        cantidad: l.cantidad,
      })),
      tecnico: orden.tecnico || tecnicoId,
      total: orden.total || 0,
      fechaIngreso: orden.fechaIngreso || new Date().toISOString(),
      diagnosticoCliente: orden.diagnosticoCliente || '',
      observaciones: orden.observaciones || '',
    };

    console.log('[handleFinalSubmit] Payload enviado:', payload);

    const res = await osService.crearOrdenServicio(payload);

    if (res.success && res.details?.orden?._id) {
      console.log('✅ Orden de servicio creada con éxito:', res.details.orden);

      // ✅ usar reducer en lugar de setIds
      dispatch({
        type: 'SET_ORDEN',
        payload: { ordenId: res.details.orden._id },
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
