import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { createLineaServicio } from './useLineaServicio';

const baseOrden = {
  fechaIngreso: '',
  diagnostico: '',
  observaciones: '',
  total: 0,
  crearLinea: false,
  lineas: [createLineaServicio()], // ✅ arranca con defaults
};

const OrdenServicioContext = createContext();

export function OrdenServicioProvider({ children, initialValues = {} }) {
  const [orden, setOrden] = useState({ ...baseOrden, ...initialValues });

  const handleChangeOrden = useCallback((field, value) => {
    setOrden((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleChangeLinea = useCallback((idx, field, value) => {
    setOrden((prev) => {
      const rawLineas = prev.lineas?.length
        ? prev.lineas
        : [createLineaServicio()];
      const mergedLinea = createLineaServicio(rawLineas[idx] || {});
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

      let newLineas = [
        ...rawLineas.slice(0, idx),
        updatedLinea,
        ...rawLineas.slice(idx + 1),
      ];

      if (field === 'crearLinea' && value === true) {
        newLineas = [...newLineas, createLineaServicio()]; // ✅ nunca {}
      }

      const total = newLineas.reduce(
        (acc, l) => acc + (Number(l.subTotal) || 0),
        0
      );

      return {
        ...prev,
        lineas: newLineas.map((l) => createLineaServicio(l)), // ✅ sanear todas
        total,
        crearLinea: field === 'crearLinea' ? value : prev.crearLinea,
      };
    });
  }, []);

  const value = useMemo(
    () => ({ orden, handleChangeOrden, handleChangeLinea }),
    [orden, handleChangeOrden, handleChangeLinea]
  );

  return (
    <OrdenServicioContext.Provider value={value}>
      {children}
    </OrdenServicioContext.Provider>
  );
}

export function useOrdenServicioContext() {
  const ctx = useContext(OrdenServicioContext);
  if (!ctx) {
    throw new Error(
      'useOrdenServicioContext debe usarse dentro de OrdenServicioProvider'
    );
  }
  return ctx;
}
