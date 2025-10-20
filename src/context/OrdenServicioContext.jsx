import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';

const OrdenServicioContext = createContext(null);

export function OrdenServicioProvider({
  children,
  defaults = {},
  initialValues = {},
}) {
  const [orden, setOrden] = useState(() => ({
    ...defaults,
    ...initialValues,
    lineas:
      Array.isArray(initialValues.lineas) && initialValues.lineas.length > 0
        ? initialValues.lineas.map((l) => ({
            _uid: crypto.randomUUID(),
            ...l,
          }))
        : [
            {
              _uid: crypto.randomUUID(),
              ...(typeof defaults.createLineaServicio === 'function'
                ? defaults.createLineaServicio()
                : {}),
            },
          ],
  }));

  const { ids, handleStepSubmit, handleFinalSubmit, resetClienteId } =
    useOrdenServicioWizard();

  // 🧩 Logger centralizado para debugging
  const logEvent = useCallback((type, payload = null) => {
    const color =
      {
        LINEA_CHANGE: 'color:#1e90ff',
        LINEA_SUBTOTAL_UPDATED: 'color:#2ecc71',
        LINEA_ADDED: 'color:#f39c12',
        LINEA_REMOVED: 'color:#e74c3c',
        ORDEN_CHANGE: 'color:#9b59b6',
        RESET_CLIENTE: 'color:#9b59b6',
        RESET_EQUIPO: 'color:#9b59b6',
      }[type] || 'color:gray';

    console.groupCollapsed(`%c🧩 [OrdenServicioEvent] ${type}`, color);
    if (payload) console.log('➡️ Payload:', payload);
    console.groupEnd();
  }, []);

  // 🔁 Reset cliente
  const resetClienteIdMemo = useCallback(() => {
    resetClienteId?.();
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
    logEvent('RESET_CLIENTE');
  }, [resetClienteId, logEvent]);

  // 🔁 Reset equipo
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
    logEvent('RESET_EQUIPO');
  }, [logEvent]);

  // ➕ Agregar línea
  const handleAgregarLinea = useCallback(() => {
    logEvent('LINEA_ADD_START');
    setOrden((prev) => {
      const nuevaLinea =
        typeof defaults.createLineaServicio === 'function'
          ? defaults.createLineaServicio()
          : {};
      const nueva = { _uid: crypto.randomUUID(), ...nuevaLinea };
      const updated = { ...prev, lineas: [...prev.lineas, nueva] };
      logEvent('LINEA_ADDED', { totalLineas: updated.lineas.length });
      return updated;
    });
  }, [defaults, logEvent]);

  // 🗑️ Eliminar línea (ya sin callback externo)
  const handleRemoveLinea = useCallback(
    async (idx) => {
      setOrden((prev) => {
        const nuevas = prev.lineas.filter((_, i) => i !== idx);
        const total = nuevas.reduce(
          (acc, l) => acc + (Number(l.subTotal) || 0),
          0
        );
        const updated = { ...prev, lineas: nuevas, total };
        logEvent('LINEA_REMOVED', {
          removedAt: idx,
          totalLineas: nuevas.length,
        });
        return updated;
      });
    },
    [logEvent]
  );

  // 🔁 Cambios en una línea
  const handleChangeLinea = useCallback(
    (idx, field, value) => {
      setOrden((prev) => {
        const lineasPrevias = prev.lineas ?? [];
        const lineaActual = lineasPrevias[idx];
        if (!lineaActual) return prev;

        const nuevaLinea = { ...lineaActual, [field]: value };

        if (field === 'cantidad' || field === 'precioUnitario') {
          const cantidad = Number(
            field === 'cantidad' ? value : lineaActual.cantidad
          );
          const precio = Number(
            field === 'precioUnitario' ? value : lineaActual.precioUnitario
          );
          nuevaLinea.subTotal = cantidad * precio;
          logEvent('LINEA_SUBTOTAL_UPDATED', {
            idx,
            cantidad,
            precio,
            subTotal: nuevaLinea.subTotal,
          });
        }

        const nuevasLineas = [...lineasPrevias];
        nuevasLineas[idx] = nuevaLinea;
        const total = nuevasLineas.reduce(
          (acc, l) => acc + (Number(l.subTotal) || 0),
          0
        );

        const nuevoOrden = { ...prev, lineas: nuevasLineas, total };
        logEvent('LINEA_CHANGE', { idx, field, value, total });
        return nuevoOrden;
      });
    },
    [logEvent]
  );

  // 🧾 Cambios generales en la orden
  const handleChangeOrden = useCallback(
    (field, value) => {
      setOrden((prev) => ({ ...prev, [field]: { ...prev[field], ...value } }));
      logEvent('ORDEN_CHANGE', { field, value });
    },
    [logEvent]
  );

  // 🧠 Context value memoizado
  const value = useMemo(
    () => ({
      orden,
      setOrden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      handleRemoveLinea,
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteId: resetClienteIdMemo,
      resetEquipoId,
    }),
    [
      orden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      handleRemoveLinea,
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
