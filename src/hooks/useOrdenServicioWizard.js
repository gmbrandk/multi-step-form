// src/hooks/useOrdenServicioWizard.js
import { useState } from 'react';
import { getClienteService } from '../services/clienteService';
import { getEquipoService } from '../services/equipoService';
import { getOrdenServicioService } from '../services/ordenServicioService';

export function useOrdenServicioWizard({ tecnicoId } = {}) {
  const [ids, setIds] = useState({});

  const resetClienteId = () => {
    setIds((prev) => {
      if (!prev.clienteId) return prev;
      console.log('[Wizard] 🔄 ClienteId reseteado por cambio de DNI');
      const { clienteId, ...rest } = prev;
      return rest;
    });
  };

  // Ahora handleStepSubmit usa el ids interno (NO se le pasa ids desde afuera)
  const handleStepSubmit = async (currentStep, orden) => {
    console.log(`[Wizard] Submitting step: ${currentStep.id}`);
    console.log('[Wizard] Orden actual:', orden);
    console.log('[Wizard] IDs actuales:', ids);

    const data = orden[currentStep.id] || {};

    // === CLIENTE ===
    if (currentStep.id === 'cliente') {
      const dataId = data?._id;

      // Si orden trae un _id (selección desde autocomplete),
      // sincronizamos ids: si difiere actualizamos; si coincide skip.
      if (dataId) {
        if (ids.clienteId && ids.clienteId === dataId) {
          console.log('👤 Cliente ya procesado y coincide:', dataId);
          return true;
        }
        console.log(
          '👤 Cliente detectado en orden (actualizando ids):',
          dataId
        );
        setIds((prev) => ({ ...prev, clienteId: dataId }));
        return true;
      }

      // Si no hay data._id pero ya tenemos clienteId creado previamente → skip
      if (ids.clienteId) {
        console.log('⚡ Cliente ya procesado → skip', ids.clienteId);
        return true;
      }

      // Ningún id: crear cliente nuevo
      console.log('🆕 Creando nuevo cliente...', data);
      const res = await getClienteService().crearCliente(data);
      if (res.success) {
        const nuevoId = res.details.cliente._id;
        console.log('✅ Cliente creado:', nuevoId);
        setIds((prev) => ({ ...prev, clienteId: nuevoId }));
        return true;
      } else {
        console.error('❌ Error creando cliente:', res.message);
        return false;
      }
    }

    // === EQUIPO ===
    // === EQUIPO ===
    if (currentStep.id === 'equipo') {
      // Caso 1: ya existe un equipo
      if (orden.equipo?._id) {
        console.log('💻 Equipo existente detectado:', orden.equipo._id);
        setIds((prev) => ({ ...prev, equipoId: orden.equipo._id }));
        return true;
      }

      // Caso 2: el usuario quiere especificaciones pero aún no hay equipo → NO crear todavía
      if (orden.equipo?.especificaciones) {
        console.log('📝 Agregar especificaciones sin crear equipo todavía');
        return true; // Avanza directamente al step ficha técnica
      }

      // Caso 3: crear equipo nuevo
      const clienteIdParaEquipo = ids.clienteId || orden.cliente?._id;
      if (!clienteIdParaEquipo) {
        console.error('❌ Falta clienteId para crear equipo');
        alert(
          'Por favor seleccione o cree un cliente antes de registrar el equipo.'
        );
        return false;
      }

      console.log('🆕 Creando nuevo equipo...', {
        ...orden.equipo,
        clienteActual: clienteIdParaEquipo,
      });

      const res = await getEquipoService().crearEquipo({
        ...orden.equipo,
        clienteActual: clienteIdParaEquipo,
      });

      if (res.success) {
        const nuevo = res.details.equipo;
        console.log('✅ Equipo creado:', nuevo);
        setIds((prev) => ({ ...prev, equipoId: nuevo._id }));
        return true;
      } else {
        console.error('❌ Error creando equipo:', res.message);
        alert(`❌ Error creando equipo: ${res.message}`);
        return false;
      }
    }

    // === FICHA TÉCNICA ===
    if (currentStep.id === 'ficha-tecnica') {
      const clienteIdParaEquipo = ids.clienteId || orden.cliente?._id;
      if (!clienteIdParaEquipo) {
        console.error('❌ Falta clienteId para crear equipo con ficha técnica');
        alert(
          'Debe seleccionar o crear un cliente antes de registrar el equipo.'
        );
        return false;
      }

      console.log('🛠️ Creando equipo con ficha técnica...', {
        ...orden.equipo,
        fichaTecnicaManual: orden.fichaTecnica, // 👈 la data del paso
        clienteActual: clienteIdParaEquipo,
      });

      const res = await getEquipoService().crearEquipo({
        ...orden.equipo,
        fichaTecnicaManual: orden.fichaTecnica,
        clienteActual: clienteIdParaEquipo,
      });

      if (res.success) {
        const nuevo = res.details.equipo;
        console.log('✅ Equipo creado con ficha técnica:', nuevo);
        setIds((prev) => ({ ...prev, equipoId: nuevo._id }));
        return true;
      } else {
        console.error(
          '❌ Error creando equipo con ficha técnica:',
          res.message
        );
        alert(`❌ Error creando equipo: ${res.message}`);
        return false;
      }
    }

    return true;
  };

  // handleFinalSubmit ahora recibe orden y usa ids interno
  const handleFinalSubmit = async (orden) => {
    console.log('🚀 Submitting Orden de Servicio final...');
    console.log('[Wizard] IDs finales:', ids);
    console.log('[Wizard] Orden final:', orden);

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

    if (res.success) {
      console.log('✅ Orden de servicio creada con éxito:', res.details.orden);
      setIds((prev) => ({ ...prev, ordenId: res.details.orden._id }));
      return res;
    } else {
      console.error('❌ Error creando orden de servicio:', res.message);
      alert(`❌ Error creando orden: ${res.message}`);
      return false;
    }
  };

  return { ids, handleStepSubmit, handleFinalSubmit, resetClienteId };
}
