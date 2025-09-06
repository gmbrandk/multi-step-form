import { Step1 } from './forms/Step1';
import { Step2 } from './forms/Step2';
import { Step3 } from './forms/Step3';
import { StepFichaTecnica } from './forms/StepFichaTecnica';
import { StepLineaServicio } from './forms/StepLineaServicio';

export const getSteps = (formData) => {
  console.log('🪄 getSteps → formData:', formData);

  return [
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
      hidden: !formData?.equipo?.especificaciones,
    },
    {
      id: 'orden-servicio',
      title: 'Crear OS',
      subtitle: 'Ingresa tipo de Servicio',
      Component: Step3,
      hidden: false,
    },
    {
      id: 'linea-extra',
      title: 'Nueva línea de servicio',
      subtitle: 'Detalles de la línea adicional',
      Component: StepLineaServicio,
      hidden: !formData?.['orden-servicio']?.crearLinea,
      fields: [
        {
          name: 'categoria',
          type: 'select',
          label: { name: 'Categoría', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'nombreTrabajo',
          type: 'text',
          label: { name: 'Nombre del trabajo', className: 'sr-only' },
          gridColumn: '1 / 4',
        },
        {
          name: 'cantidad',
          type: 'number',
          label: { name: 'Cantidad', className: 'sr-only' },
          gridColumn: '1 / 2',
        },
        {
          name: 'precioUnitario',
          type: 'number',
          label: { name: 'Precio unitario', className: 'sr-only' },
          gridColumn: '2 / 3',
        },
        {
          name: 'total',
          type: 'number',
          label: { name: 'Total', className: 'sr-only' },
          gridColumn: '3 / 4',
        },
        {
          name: 'crearLinea',
          type: 'checkbox',
          label: {
            name: 'Crear nueva línea de Servicio',
            className: 'fs-subtitle inline',
          },
          gridColumn: '1 / 4',
        },
      ],
    },
  ];
};
