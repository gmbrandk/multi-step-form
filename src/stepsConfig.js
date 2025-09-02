import { Step1 } from './forms/Step1';
import { Step2 } from './forms/Step2';
import { Step3 } from './forms/Step3';
import { StepFichaTecnica } from './forms/StepFichaTecnica';

export const getSteps = (formData) => [
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
    title: 'Crear OS N°',
    subtitle: 'Ingresa tipo de Servicio',
    Component: Step3,
  },
];
