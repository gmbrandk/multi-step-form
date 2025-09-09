// hooks/useOrdenServicioWizard.js
import { useState } from 'react';
import {
  createCliente,
  createEquipo,
  createOrdenServicio,
  finalizeOrdenServicio,
} from '../services/ordenServicioService';

export function useOrdenServicioWizard() {
  const [ids, setIds] = useState({});

  const handleStepSubmit = (ids, orden) => async (currentStep) => {
    const data = orden[currentStep.id] || {};

    if (currentStep.id === 'cliente') {
      const res = await createCliente(data);
      setIds((prev) => ({ ...prev, clienteId: res._id }));
    }

    if (currentStep.id === 'equipo') {
      const res = await createEquipo({
        ...orden.equipo,
        clienteActual: ids.clienteId,
      });
      setIds((prev) => ({ ...prev, equipoId: res._id }));
    }

    if (currentStep.id === 'orden-servicio') {
      await createOrdenServicio({
        ...data,
        cliente: ids.clienteId,
        equipo: ids.equipoId,
      });
    }
  };

  const handleFinalSubmit = async (ids, orden) => {
    await finalizeOrdenServicio(ids, orden);
  };

  return { ids, handleStepSubmit, handleFinalSubmit };
}
