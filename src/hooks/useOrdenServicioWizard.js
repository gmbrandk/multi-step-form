// src/hooks/useOrdenServicioWizard.js
import { useState } from 'react';
import { getClienteService } from '../services/clienteService';
import { getEquipoService } from '../services/equipoService';
import { getOrdenServicioService } from '../services/ordenServicioService';

export function useOrdenServicioWizard({ tecnicoId } = {}) {
  // 👈 recibimos tecnicoId
  const [ids, setIds] = useState({});

  const handleStepSubmit = (ids, orden) => async (currentStep) => {
    const data = orden[currentStep.id] || {};

    if (currentStep.id === 'cliente') {
      const res = await getClienteService().crearCliente(data);

      if (res.success) {
        alert('✅ Cliente creado correctamente');
        setIds((prev) => ({ ...prev, clienteId: res.details.cliente._id }));
      } else {
        alert(`❌ Error creando cliente: ${res.message}`);
        return false;
      }
    }

    if (currentStep.id === 'equipo') {
      const res = await getEquipoService().crearEquipo({
        ...orden.equipo,
        clienteActual: ids.clienteId,
      });

      if (res.success) {
        alert('✅ Equipo registrado correctamente');
        setIds((prev) => ({ ...prev, equipoId: res.details.equipo._id }));
      } else {
        alert(`❌ Error creando equipo: ${res.message}`);
        return false;
      }
    }

    return true;
  };

  const handleFinalSubmit = async (ids, orden) => {
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
      tecnico: orden.tecnico || tecnicoId, // 👈 aquí usamos el _id pasado
      total: orden.total || 0,
      fechaIngreso: orden.fechaIngreso || new Date().toISOString(),
      diagnosticoCliente: orden.diagnosticoCliente || '',
      observaciones: orden.observaciones || '',
    };

    console.log('[handleFinalSubmit] Payload enviado:', payload);

    const res = await osService.crearOrdenServicio(payload);

    if (res.success) {
      alert('✅ Orden de servicio creada con éxito');
      setIds((prev) => ({ ...prev, ordenId: res.details.orden._id }));
    } else {
      alert(`❌ Error creando orden: ${res.message}`);
      return false;
    }

    return res;
  };

  return { ids, handleStepSubmit, handleFinalSubmit };
}
