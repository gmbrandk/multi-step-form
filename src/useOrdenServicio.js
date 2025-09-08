import { useCallback, useState } from 'react';
import { useLineaServicio } from './useLineaServicio';

const baseOrden = {
  representanteId: '',
  equipoId: '',
  tecnico: '',
  fechaIngreso: new Date().toISOString(),
  diagnosticoCliente: '',
  observaciones: '',
  total: 0,
  lineasServicio: [],
};

export function useOrdenServicio(initialValues = {}, onChange) {
  const withDefaults = {
    ...baseOrden,
    ...initialValues,
  };

  if (!withDefaults.lineasServicio.length) {
    withDefaults.lineasServicio = [
      {
        tipoTrabajo: '',
        nombreTrabajo: '',
        descripcion: '',
        precioUnitario: 0,
        cantidad: 1,
        subTotal: 0,
        categoria: 'servicio',
      },
    ];
  }

  const [orden, setOrden] = useState(withDefaults);

  // ✅ ahora usamos los subtotales de cada línea
  const recalculateTotal = useCallback((lineas) => {
    return lineas.reduce((sum, linea) => {
      return sum + (parseFloat(linea.subTotal) || 0);
    }, 0);
  }, []);

  const handleChange = useCallback(
    (field, value) => {
      const updated = { ...orden, [field]: value };

      if (field === 'lineasServicio') {
        updated.total = recalculateTotal(value);
      }

      setOrden(updated);
      if (onChange) onChange(field, value);
    },
    [orden, onChange, recalculateTotal]
  );

  const lineas = orden.lineasServicio.map((linea, index) => {
    const { linea: merged, handleChange: handleLineaChange } = useLineaServicio(
      linea,
      (field, value) => {
        const nuevas = [...orden.lineasServicio];
        nuevas[index] = { ...nuevas[index], [field]: value };
        handleChange('lineasServicio', nuevas);
      }
    );

    return { linea: merged, handleChange: handleLineaChange };
  });

  return { orden, handleChange, lineas };
}
