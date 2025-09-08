import { Step1 } from './forms/Step1';
import { Step2 } from './forms/Step2';
import { Step3 } from './forms/Step3';
import { StepFichaTecnica } from './forms/StepFichaTecnica';
import { StepLineaServicio } from './forms/StepLineaServicio';

export const getSteps = (orden) => [
  {
    id: 'cliente',
    title: 'Crear Cliente',
    subtitle: 'Ingresa datos de cliente',
    Component: Step1,
    hidden: false,
  },
  {
    id: 'equipo',
    title: 'Crear Equipo',
    subtitle: 'Ingresa datos de equipo',
    Component: Step2,
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
    Component: Step3,
    hidden: false,
  },
  {
    id: 'lineas-servicio',
    title: 'Líneas de servicio',
    subtitle: 'Agrega una o más líneas adicionales',
    Component: StepLineaServicio,
    hidden: !orden?.crearLinea, // 👈 depende del flag en el contexto
  },
];
