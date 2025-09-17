// src/context/OrdenServicioContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { getClienteService } from '../services/clienteService';
import { getEquipoService } from '../services/equipoService';

// 👇 Importa tu hook del wizard
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';

const OrdenServicioContext = createContext();

export function OrdenServicioProvider({
  children,
  defaults = {},
  initialValues = {},
}) {
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

  // 👇 Instancia el wizard aquí una sola vez
  const { ids, handleStepSubmit, handleFinalSubmit, resetClienteId } =
    useOrdenServicioWizard();

  // 🔹 Crear cliente en backend o mock
  const crearCliente = useCallback(async (datosCliente) => {
    const service = getClienteService();
    const res = await service.crearCliente(datosCliente);

    if (res.success) {
      setOrden((prev) => ({
        ...prev,
        cliente: res.details.cliente,
      }));
    }

    return res;
  }, []);

  // 🔹 Crear equipo
  const crearEquipo = useCallback(async (datosEquipo) => {
    const service = getEquipoService();
    const res = await service.crearEquipo(datosEquipo);

    if (res.success) {
      setOrden((prev) => ({
        ...prev,
        equipo: res.details.equipo,
      }));
    }

    return res;
  }, []);

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

        if (field === 'crearLinea' && value === true) {
          if (!prev.lineas[idx + 1]) {
            if (typeof defaults.createLineaServicio === 'function') {
              newLineas.push(defaults.createLineaServicio());
            } else {
              newLineas.push({});
            }
          }
        }

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
      setOrden,
      crearCliente,
      crearEquipo,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      // 👇 Exporta wizard state + handlers al contexto
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteId,
    }),
    [
      orden,
      crearCliente,
      crearEquipo,
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
