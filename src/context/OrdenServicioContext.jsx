import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useOrdenServicioWizard } from '../hooks/useOrdenServicioWizard';

// ✅ Contexto base
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

  // 🧠 Captura la fuente del evento (archivo o función que lo llamó)
  const captureSource = () => {
    try {
      const stack = new Error().stack?.split('\n') ?? [];
      // Saltamos las primeras líneas internas del stack
      const caller =
        stack.find((line) => !line.includes('OrdenServicioProvider')) ??
        stack[2] ??
        'unknown';
      return caller.trim();
    } catch {
      return 'unknown';
    }
  };

  // 🪵 Logger mejorado con origen de evento
  const logEvent = useCallback((type, payload = null) => {
    const color =
      {
        LINEA_CHANGE: 'color:#1e90ff',
        LINEA_SUBTOTAL_UPDATED: 'color:#2ecc71',
        LINEA_ADDED: 'color:#f39c12',
        ORDEN_CHANGE: 'color:#9b59b6',
        RESET_CLIENTE: 'color:#e74c3c',
        RESET_EQUIPO: 'color:#e67e22',
        LINEA_ADD_START: 'color:#3498db',
      }[type] || 'color:gray';

    const source = captureSource();

    console.groupCollapsed(
      `%c🧩 [OrdenServicioEvent] ${type}`,
      color,
      `📍 ${source}`
    );
    if (payload) console.log('➡️ Payload:', payload);
    console.groupEnd();
  }, []);

  // 🔹 Reset cliente
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

  // 🔹 Reset equipo
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

      const updated = {
        ...prev,
        lineas: [...prev.lineas, nueva],
      };

      logEvent('LINEA_ADDED', { totalLineas: updated.lineas.length });
      return updated;
    });
  }, [defaults, logEvent]);

  // 🔄 Cambio en orden
  const handleChangeOrden = useCallback(
    (field, value) => {
      setOrden((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          ...value,
        },
      }));
      logEvent('ORDEN_CHANGE', { field, value });
    },
    [logEvent]
  );

  // 🧩 Cambio en una línea del servicio (versión corregida y estable)
  const handleChangeLinea = useCallback(
    (idx, field, value, source = 'manual') => {
      setOrden((prev) => {
        const lineasPrevias = prev.lineas ?? [];
        const lineaActual = lineasPrevias[idx];

        // ⚠️ Si la línea no existe, no hacemos nada
        if (!lineaActual) return prev;

        // 🧮 Calculamos la nueva línea
        const nuevaLinea = (() => {
          if (lineaActual[field] === value) return lineaActual; // sin cambios
          const actualizada = { ...lineaActual, [field]: value };

          // 🔁 Recalcula subtotal solo si cambia cantidad o precio
          if (field === 'cantidad' || field === 'precioUnitario') {
            const cantidad =
              field === 'cantidad'
                ? Number(value) || 0
                : Number(lineaActual.cantidad) || 0;
            const precio =
              field === 'precioUnitario'
                ? Number(value) || 0
                : Number(lineaActual.precioUnitario) || 0;
            actualizada.subTotal = cantidad * precio;

            logEvent('LINEA_SUBTOTAL_UPDATED', {
              idx,
              cantidad,
              precio,
              subTotal: actualizada.subTotal,
            });
          }

          return actualizada;
        })();

        // Si no hay cambio real → evita renders innecesarios
        if (nuevaLinea === lineaActual) return prev;

        let nuevasLineas = [...lineasPrevias];
        nuevasLineas[idx] = nuevaLinea;

        // ➕ Si el usuario marca "crearLinea" y no existe la siguiente → agrega nueva
        if (
          field === 'crearLinea' &&
          value === true &&
          !lineasPrevias[idx + 1]
        ) {
          const nueva =
            typeof defaults.createLineaServicio === 'function'
              ? defaults.createLineaServicio()
              : {};
          nuevasLineas.push({ _uid: crypto.randomUUID(), ...nueva });
          logEvent('LINEA_ADDED', { addedAt: idx + 1 });
        }

        // 🧹 Si desactiva "crearLinea" → limpiamos las líneas extra
        if (field === 'crearLinea' && value === false) {
          nuevasLineas = nuevasLineas.slice(0, idx + 1); // deja solo la línea actual
          logEvent('LINEA_REMOVED_AFTER_UNCHECK', {
            remaining: nuevasLineas.length,
          });
        }

        // 💰 Recalcula total si corresponde
        const total =
          field === 'cantidad' ||
          field === 'precioUnitario' ||
          field === 'subTotal'
            ? nuevasLineas.reduce(
                (acc, l) => acc + (Number(l.subTotal) || 0),
                0
              )
            : prev.total;

        const nuevoOrden = {
          ...prev,
          lineas: nuevasLineas,
          total,
          crearLinea: field === 'crearLinea' ? value : prev.crearLinea,
        };

        logEvent('LINEA_CHANGE', {
          idx,
          field,
          value,
          source,
          total,
          lineasCount: nuevasLineas.length,
        });

        return nuevoOrden;
      });
    },
    [defaults, logEvent]
  );

  // 📦 Valor del contexto
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
      resetEquipoId,
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

// 🧩 Hook para consumir el contexto
export function useOrdenServicioContext() {
  const ctx = useContext(OrdenServicioContext);
  if (!ctx) {
    throw new Error(
      'useOrdenServicioContext debe usarse dentro de OrdenServicioProvider'
    );
  }
  return ctx;
}
