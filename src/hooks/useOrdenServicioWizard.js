import { useState } from 'react';
import { getClienteService } from '../services/clienteService';
import { getEquipoService } from '../services/equipoService';
import { getOrdenServicioService } from '../services/ordenServicioService';

export function useOrdenServicioWizard() {
  const [ids, setIds] = useState({});

  const handleStepSubmit = (ids, orden) => async (currentStep) => {
    const data = orden[currentStep.id] || {};

    if (currentStep.id === 'cliente') {
      const res = await getClienteService().crearCliente(data);
      if (res.success) {
        setIds((prev) => ({ ...prev, clienteId: res.details.cliente._id }));
      }
    }

    if (currentStep.id === 'equipo') {
      const res = await getEquipoService().crearEquipo({
        ...orden.equipo,
        clienteActual: ids.clienteId,
      });
      if (res.success) {
        setIds((prev) => ({ ...prev, equipoId: res.details.equipo._id }));
      }
    }
  };

  // 👇 este es el “submit final” del wizard
  const handleFinalSubmit = async (ids, orden) => {
    const osService = getOrdenServicioService();
    const data = orden['orden-servicio'] || {};

    const res = await osService.crearOrdenServicio({
      ...data,
      cliente: ids.clienteId,
      equipo: ids.equipoId,
    });

    if (res.success) {
      setIds((prev) => ({ ...prev, ordenId: res.details.orden._id }));
    }

    return res;
  };

  return { ids, handleStepSubmit, handleFinalSubmit };
}
