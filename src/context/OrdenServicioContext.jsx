// OrdenServicioProvider.jsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
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

  const { ids, handleStepSubmit, handleFinalSubmit, resetClienteId } =
    useOrdenServicioWizard();

  // 📌 Resetear cliente
  const resetClienteIdMemo = useCallback(() => {
    resetClienteId?.(); // sigue llamando a lo que te da el wizard
    setOrden((prev) => ({
      ...prev,
      cliente: {
        _id: null,
        dni: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
      },
    }));
  }, [resetClienteId]);

  // 📌 Resetear equipo
  const resetEquipoId = useCallback(() => {
    setOrden((prev) => ({
      ...prev,
      equipo: {
        _id: null,
        nroSerie: '',
        tipo: '',
        marca: '',
        modelo: '',
        sku: '',
        macAddress: '',
        imei: '',
        estado: '',
      },
    }));
  }, []);

  const handleAgregarLinea = useCallback(() => {
    setOrden((prev) => ({
      ...prev,
      lineas: [...prev.lineas, defaults.createLineaServicio()],
    }));
  }, [defaults]);

  const handleChangeOrden = (field, value) => {
    setOrden((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...value,
      },
    }));
  };

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
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteId: resetClienteIdMemo,
      resetEquipoId, // 👈 ahora sí expuesto
    }),
    [
      orden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteIdMemo,
      resetEquipoId,
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
