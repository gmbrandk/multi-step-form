import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

// 👇 Importa tu hook del wizard
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';

const OrdenServicioContext = createContext();

export function OrdenServicioProvider({
  children,
  defaults = {},
  initialValues = {},
}) {
  // 📌 Estado del formulario
  const [orden, setOrden] = useState(() => ({
    ...defaults,
    ...initialValues,
    lineas:
      initialValues.lineas && initialValues.lineas.length > 0
        ? initialValues.lineas
        : [
            typeof defaults.createLineaServicio === 'function'
              ? defaults.createLineaServicio()
              : {},
          ],
  }));

  // 📌 Wizard maneja ids + submit de pasos/final
  const { ids, handleStepSubmit, handleFinalSubmit, resetClienteId } =
    useOrdenServicioWizard();

  // 📌 Agregar línea de servicio
  const handleAgregarLinea = useCallback(() => {
    setOrden((prev) => ({
      ...prev,
      lineas: [...prev.lineas, defaults.createLineaServicio()],
    }));
  }, [defaults]);

  // 📌 Cambiar campo general de la orden
  const handleChangeOrden = useCallback((field, value) => {
    setOrden((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 📌 Cambiar campo de línea específica
  const handleChangeLinea = useCallback(
    (idx, field, value) => {
      setOrden((prev) => {
        const rawLineas = prev.lineas ?? [];
        const current = rawLineas[idx] ?? {};
        const updatedLinea = { ...current, [field]: value };

        // Recalcular subtotal
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

        // Auto-crear nueva línea si corresponde
        if (field === 'crearLinea' && value === true) {
          if (!prev.lineas[idx + 1]) {
            if (typeof defaults.createLineaServicio === 'function') {
              newLineas.push(defaults.createLineaServicio());
            } else {
              newLineas.push({});
            }
          }
        }

        // Calcular total de la orden
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

  // 📌 Valor expuesto en el contexto
  const value = useMemo(
    () => ({
      orden,
      setOrden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      // 👇 Wizard state + handlers
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteId,
    }),
    [
      orden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteId,
    ]
  );

  return (
    <OrdenServicioContext.Provider value={value}>
      {children}
    </OrdenServicioContext.Provider>
  );
}

export function useOrdenServicioContext() {
  const ctx = useContext(OrdenServicioContext);
  if (!ctx)
    throw new Error(
      'useOrdenServicioContext debe usarse dentro de OrdenServicioProvider'
    );
  return ctx;
}
