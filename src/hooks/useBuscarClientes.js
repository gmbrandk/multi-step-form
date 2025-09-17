import { useEffect, useState } from 'react';

export function useBuscarClientes(dni) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🔹 Si el DNI es vacío o muy corto → limpiamos y salimos
    if (!dni || dni.length < 3) {
      setClientes([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchClientes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/clientes/?dni=${dni}`,
          {
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (data.success) {
          const normalized = (data.details.clientes || []).map((c) => ({
            ...c,
            _source: 'api', // 🔖 para saber de dónde viene
          }));
          setClientes(normalized);
        } else {
          // en caso de error del backend → limpiamos
          setClientes([]);
          console.warn('[useBuscarClientes] Respuesta sin éxito:', data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[useBuscarClientes] Error de fetch:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    // ⏱ debounce de 300ms
    const timeout = setTimeout(fetchClientes, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort(); // 🛑 cancelamos fetch si cambia el dni rápido
    };
  }, [dni]);

  return { clientes, loading };
}
