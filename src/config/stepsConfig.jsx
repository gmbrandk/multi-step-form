// stepsConfig.js
import { StepCliente } from '../components/forms/StepCliente';
import { StepEquipo } from '../components/forms/StepEquipo';
import { StepFichaTecnica } from '../components/forms/StepFichaTecnica';
import { StepLineaServicio } from '../components/forms/StepLineaServicio';
import { StepOrdenServicio } from '../components/forms/StepOrdenServicio';

export const getSteps = (orden) => {
  const baseSteps = [
    {
      id: 'cliente',
      title: 'Crear Cliente',
      subtitle: 'Ingresa datos de cliente',
      Component: StepCliente,
      hidden: false,
    },
    {
      id: 'equipo',
      title: 'Crear Equipo',
      subtitle: 'Ingresa datos de equipo',
      Component: StepEquipo,
      hidden: false,
    },
    {
      id: 'ficha-tecnica',
      title: 'Ficha Técnica',
      subtitle: 'Detalles del hardware',
      Component: StepFichaTecnica,
      hidden: !orden?.equipo?.especificaciones,
    },
    {
      id: 'orden-servicio',
      title: 'Crear OS',
      subtitle: 'Ingresa tipo de Servicio',
      Component: StepOrdenServicio,
      hidden: false,
    },
  ];

  const lineSteps = (orden?.lineas || []).map((linea, idx) => ({
    id: `linea-${idx}`,
    title: `Línea de servicio #${idx + 1}`,
    subtitle: linea.nombreTrabajo || 'Configura la línea',
    Component: () => <StepLineaServicio index={idx} />,
    hidden: !orden?.crearLinea,
  }));

  return [...baseSteps, ...lineSteps];
};
