import { Step1 } from './forms/Step1';
import { Step2 } from './forms/Step2';
import { Step3 } from './forms/Step3';
import { StepFichaTecnica } from './forms/StepFichaTecnica';
import { StepLineaServicio } from './forms/StepLineaServicio';

export const getSteps = (formData) => {
  const steps = [
    {
      id: 'cliente',
      title: 'Crear Cliente',
      subtitle: 'Ingresa datos de cliente',
      Component: Step1,
    },
    {
      id: 'equipo',
      title: 'Crear Equipo',
      subtitle: 'Ingresa datos de equipo',
      Component: Step2,
    },
    ...(formData?.equipo?.especificaciones
      ? [
          {
            id: 'ficha-tecnica',
            title: 'Ficha Técnica',
            subtitle: 'Detalles del hardware',
            Component: StepFichaTecnica,
          },
        ]
      : []),
    {
      id: 'orden-servicio',
      title: 'Crear OS',
      subtitle: 'Ingresa tipo de Servicio',
      Component: Step3,
    },

    // 👇 pasos de ejemplo estáticos, con el mismo patrón
    {
      id: 'linea-servicio-0',
      title: 'Línea de servicio #1',
      subtitle: 'Detalles del trabajo',
      Component: StepLineaServicio,
    },
    {
      id: 'linea-servicio-1',
      title: 'Línea de servicio #2',
      subtitle: 'Detalles del trabajo',
      Component: StepLineaServicio,
    },
  ];

  return steps;
};
