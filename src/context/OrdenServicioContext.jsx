// OrdenServicioContext.js
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const OrdenServicioContext = createContext();

export function OrdenServicioProvider({
  children,
  defaults = {},
  initialValues = {},
}) {
  const [orden, setOrden] = useState(() => {
    // 🔹 merge defaults + initialValues sin forzar lineas
    return {
      ...defaults,
      ...initialValues,
      lineas: initialValues.lineas ?? [],
    };
  });

  const handleAgregarLinea = useCallback(() => {
    setOrden((prev) => ({
      ...prev,
      lineas: [...prev.lineas, defaults.createLineaServicio()],
    }));
  }, [defaults]);

  const handleChangeOrden = useCallback((field, value) => {
    setOrden((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleChangeLinea = useCallback(
    (idx, field, value) => {
      setOrden((prev) => {
        const rawLineas = prev.lineas ?? [];

        const current = rawLineas[idx] ?? {};
        const updatedLinea = { ...current, [field]: value };

        // 🔹 recalcular subtotal si corresponde
        if (field === 'cantidad' || field === 'precioUnitario') {
          const cantidad =
            field === 'cantidad'
              ? Number(value) || 0
              : Number(current.cantidad) || 0;
          const precio =
            field === 'precioUnitario'
              ? Number(value) || 0
              : Number(current.precioUnitario) || 0;
          updatedLinea.subTotal = cantidad * precio;
        }

        let newLineas = [
          ...rawLineas.slice(0, idx),
          updatedLinea,
          ...rawLineas.slice(idx + 1),
        ];

        // 🔹 si marcaron "crearLinea", agregamos una sola vez
        if (field === 'crearLinea' && value === true) {
          // solo agregar nueva línea si no existe
          if (!prev.lineas[idx + 1]) {
            if (typeof defaults.createLineaServicio === 'function') {
              newLineas.push(defaults.createLineaServicio());
            } else {
              newLineas.push({});
            }
          }
        }

        // 🔹 recalcular total
        const total = newLineas.reduce(
          (acc, l) => acc + (Number(l.subTotal) || 0),
          0
        );

        return {
          ...prev,
          lineas: newLineas,
          total,
          crearLinea: field === 'crearLinea' ? value : prev.crearLinea,
        };
      });
    },
    [defaults]
  );

  const value = useMemo(
    () => ({
      orden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea, // 👈 nuevo
    }),
    [orden, handleChangeOrden, handleChangeLinea, handleAgregarLinea]
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
