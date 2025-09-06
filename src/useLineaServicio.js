import { useCallback, useState } from 'react';

const baseLinea = {
  tipoTrabajo: '', // id o categoría de trabajo
  nombreTrabajo: '', // texto libre
  descripcion: '', // textarea
  precioUnitario: 0,
  cantidad: 1,
  total: 0,
};

export function useLineaServicio(initialValues = {}, onChange) {
  const [linea, setLinea] = useState({ ...baseLinea, ...initialValues });

  const handleChange = useCallback(
    (field, value) => {
      let updated = { ...linea, [field]: value };

      // cálculo del total
      const cantidad = parseFloat(updated.cantidad || 0);
      const precio = parseFloat(updated.precioUnitario || 0);
      updated.total = (cantidad * precio).toFixed(2);

      setLinea(updated);
      if (onChange) onChange(updated); // notificamos hacia arriba
    },
    [linea, onChange]
  );

  return { linea, handleChange };
}
