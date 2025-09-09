import { useOrdenServicioContext } from './OrdenServicioContext';
import { MultiStepFormCore } from './MultiStepFormCore';

// función para simular requests
const simulateRequest = async (endpoint, body) => {
  console.log(`📡 Simulación POST ${endpoint}`, body);
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeId = Math.random().toString(36).substring(2, 10);
      const response = { _id: fakeId };
      console.log('✅ Simulación response', response);
      resolve(response);
    }, 500);
  });
};

export default function MultiStepForm() {
  const { orden } = useOrdenServicioContext();

  const handleSubmit = async (finalOrden) => {
    // aquí puedes armar el payload y mandar al backend
    await simulateRequest('/ordenes-servicio/final', finalOrden);
    console.log('✅ Payload final listo para enviar', finalOrden);
  };

  return <MultiStepFormCore orden={orden} onSubmit={handleSubmit} />;
}
