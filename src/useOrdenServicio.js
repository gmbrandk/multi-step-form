import { useCallback, useState } from 'react';

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
  const [orden, setOrden] = useState({ ...baseOrden, ...initialValues });

  const handleChange = useCallback(
    (field, value) => {
      const updated = { ...orden, [field]: value };

      // recalcular total desde lineasServicio
      if (field === 'lineasServicio') {
        updated.total = updated.lineasServicio.reduce((sum, linea) => {
          const cantidad = parseFloat(linea.cantidad || 0);
          const precio = parseFloat(linea.precioUnitario || 0);
          return sum + cantidad * precio;
        }, 0);
      }

      setOrden(updated);
      if (onChange) onChange(updated);
    },
    [orden, onChange]
  );

  // helper para manejar una línea específica
  const updateLinea = (index, linea) => {
    const lineas = [...orden.lineasServicio];
    lineas[index] = linea;
    handleChange('lineasServicio', lineas);
  };

  return { orden, handleChange, updateLinea };
}
