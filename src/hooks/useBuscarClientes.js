import { useEffect, useState } from 'react';

export function useBuscarClientes(dni) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dni || dni.length < 3) {
      setClientes([]);
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
        const data = await res.json();
        if (data.success) {
          // 👇 etiquetar cada cliente como "api"
          const normalized = (data.details.clientes || []).map((c) => ({
            ...c,
            _source: 'api',
          }));
          setClientes(normalized);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchClientes, 300); // debounce 300ms

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [dni]);

  return { clientes, loading };
}
