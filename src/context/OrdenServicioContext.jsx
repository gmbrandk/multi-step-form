// src/context/OrdenServicioContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

  // 🧩 Logger centralizado
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
        LINEA_BLOQUEADA: 'color:#f39c12',
        LINEA_DESBLOQUEADA: 'color:#27ae60',
      }[type] || 'color:gray';
    console.groupCollapsed(`%c🧩 [OrdenServicioEvent] ${type}`, color);
    if (payload) console.log('➡️ Payload:', payload);
    console.groupEnd();
  }, []);

  // 🧠 Estado de bloqueos por índice
  const [bloqueosAgregar, setBloqueosAgregar] = useState({});

  const bloquearLinea = useCallback(
    (uidOrIndex, valor = true) => {
      setBloqueosAgregar((prev) => ({
        ...prev,
        [uidOrIndex]: valor,
      }));
      logEvent(valor ? 'LINEA_BLOQUEADA' : 'LINEA_DESBLOQUEADA', {
        uidOrIndex,
      });
    },
    [logEvent]
  );

  const isLineaBloqueada = useCallback(
    (uidOrIndex) => !!bloqueosAgregar[uidOrIndex],
    [bloqueosAgregar]
  );

  // 🧹 Limpieza de bloqueos obsoletos
  useEffect(() => {
    setBloqueosAgregar((prev) => {
      const validIndexes = orden.lineas.map((_, i) => i);
      const cleaned = Object.fromEntries(
        Object.entries(prev).filter(([i]) => validIndexes.includes(Number(i)))
      );
      if (Object.keys(cleaned).length !== Object.keys(prev).length) {
        console.log('🧹 Limpieza de bloqueos obsoletos:', cleaned);
        return cleaned;
      }
      return prev;
    });
  }, [orden.lineas]);

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

  // ➕ Agregar línea (con reindexado limpio)
  const handleAgregarLinea = useCallback(() => {
    logEvent('LINEA_ADD_START');

    setOrden((prev) => {
      const nuevaLinea = {
        _uid: crypto.randomUUID(),
        codigo: '',
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        subTotal: 0,
      };

      const nuevas = [...prev.lineas, nuevaLinea];
      const total = nuevas.reduce(
        (acc, l) => acc + (Number(l.subTotal) || 0),
        0
      );

      // 🔒 Actualizar bloqueos según el nuevo tamaño
      setBloqueosAgregar((prevBloqueos) => {
        const actualizados = { ...prevBloqueos };

        // Si hay más de una línea, bloquear la base
        if (nuevas.length > 1) actualizados[0] = true;

        // Asegurar que la nueva línea (última) quede desbloqueada
        const nuevaIndex = nuevas.length - 1;
        delete actualizados[nuevaIndex];

        console.log(
          '🔒 handleAgregarLinea → bloqueos actualizados:',
          actualizados
        );
        return actualizados;
      });

      return { ...prev, lineas: nuevas, total };
    });

    logEvent('LINEA_ADDED');

    if (typeof window !== 'undefined' && window.addStepToWizard) {
      console.log('🧭 Agregando paso al wizard (intención).');
      window.addStepToWizard?.();
    }
  }, [logEvent]);

  // 🗑️ Eliminar línea (con reindexado garantizado)
  const handleRemoveLinea = useCallback(
    async (idx) => {
      console.groupCollapsed(
        `%c[handleRemoveLinea] 🔴 Eliminando línea index=${idx}`,
        'color:#c0392b;font-weight:bold'
      );
      logEvent('LINEA_REMOVE_START', { index: idx });

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

        // 🧠 Reindexar bloqueos
        setBloqueosAgregar((prevBloqueos) => {
          const copy = { ...prevBloqueos };
          delete copy[idx];

          const reindexed = {};
          Object.keys(copy).forEach((key) => {
            const oldIndex = Number(key);
            const newIndex = oldIndex > idx ? oldIndex - 1 : oldIndex;
            reindexed[newIndex] = copy[oldIndex];
          });

          // ✅ Desbloquear línea base si solo queda una
          if (nuevas.length <= 1) delete reindexed[0];

          console.log(
            '🧩 handleRemoveLinea → bloqueos reindexados:',
            reindexed
          );
          return reindexed;
        });

        return updated;
      });

      if (typeof window !== 'undefined' && window.removeStepFromWizard) {
        const stepId = `linea-${idx + 1}`;
        console.log(`🧭 Eliminando paso del wizard: ${stepId}`);
        window.removeStepFromWizard(stepId);
      }

      logEvent('LINEA_DESBLOQUEADA', { index: idx });
      console.groupEnd();
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

  // 🧠 Context memoizado
  const value = useMemo(
    () => ({
      orden,
      setOrden,
      handleChangeOrden,
      handleChangeLinea,
      handleAgregarLinea,
      handleRemoveLinea,
      bloquearLinea,
      isLineaBloqueada,
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
      bloquearLinea,
      isLineaBloqueada,
      ids,
      handleStepSubmit,
      handleFinalSubmit,
      resetClienteIdMemo,
      resetEquipoId,
    ]
  );

  // 🧭 Debug visual del estado de bloqueos
  useEffect(() => {
    console.log('🧠 [OrdenServicioContext] Estado bloqueos:', bloqueosAgregar);
  }, [bloqueosAgregar]);

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
