// useOrdenServicio.js
import { useCallback, useMemo } from 'react';
import { createLineaServicio } from './useLineaServicio';

const baseOrden = {
  fechaIngreso: '',
  diagnostico: '',
  observaciones: '',
  total: 0,
  crearLinea: false,
};

/**
 * Hook que maneja toda la Orden de Servicio
 */
export function useOrdenServicio(values = {}, onChange) {
  // 1️⃣ Merge baseOrden con valores del padre
  const orden = useMemo(() => ({ ...baseOrden, ...values }), [values]);

  // 2️⃣ Garantizamos que exista al menos una línea
  const rawLineas = orden.lineas?.length ? orden.lineas : [{}];

  // 3️⃣ Generamos la representación para cada línea
  const lineas = rawLineas.map((linea, idx) => {
    const mergedLinea = createLineaServicio(linea);

    const handleChange = (field, value) => {
      if (!onChange) return;

      // calcular línea actualizada
      let updatedLinea = { ...mergedLinea, [field]: value };

      if (field === 'cantidad' || field === 'precioUnitario') {
        const cantidad =
          field === 'cantidad'
            ? Number(value) || 0
            : Number(mergedLinea.cantidad) || 0;
        const precio =
          field === 'precioUnitario'
            ? Number(value) || 0
            : Number(mergedLinea.precioUnitario) || 0;
        updatedLinea.subTotal = cantidad * precio;
      }

      // crear nuevo array de líneas
      let newLineas = [
        ...rawLineas.slice(0, idx),
        updatedLinea,
        ...rawLineas.slice(idx + 1),
      ];

      // Manejo especial de crearLinea
      if (updatedLinea.crearLinea === true) {
        newLineas = newLineas.map((l, i) =>
          i === idx ? { ...l, crearLinea: false } : l
        );
        newLineas = [...newLineas, createLineaServicio()]; // 👈 con defaults
      }

      // reportar hacia arriba
      onChange('lineas', newLineas);

      // recalcular total
      const total = newLineas.reduce(
        (acc, l) => acc + (Number(l.subTotal) || 0),
        0
      );
      onChange('total', total);
    };

    return { linea: mergedLinea, handleChange };
  });

  // 4️⃣ handleChange para campos de la orden (no de líneas)
  const handleChangeOrden = useCallback(
    (field, value) => {
      if (!onChange) return;
      onChange(field, value);
    },
    [onChange]
  );

  return { orden, lineas, handleChangeOrden };
}
