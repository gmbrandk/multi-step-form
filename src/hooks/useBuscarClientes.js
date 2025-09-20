import { useEffect, useState } from 'react';

export function useBuscarClientes(dni, minLength = 4) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Autocomplete (sugerencias mientras escribe)
  useEffect(() => {
    if (!dni) {
      console.log('[useBuscarClientes] No se ingresó DNI, no se busca.');
      setClientes([]);
      setLoading(false);
      return;
    }

    if (dni.length < minLength) {
      console.log(
        `[useBuscarClientes] DNI demasiado corto (${dni.length} dígitos, min=${minLength}), no se busca.`
      );
      setClientes([]);
      setLoading(false);
      return;
    }

    if (dni.length === 8) {
      console.log(
        `[useBuscarClientes] DNI completo (${dni}), no se buscan sugerencias.`
      );
      setClientes([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchClientes = async () => {
      console.log(`[useBuscarClientes] Fetching clientes con dni=${dni}`);
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/clientes/search?dni=${dni}&mode=autocomplete`,
          {
            signal: controller.signal,
            credentials: 'include', // 🔑 cookie de sesión
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log('[useBuscarClientes] Respuesta API:', data);

        if (data.success) {
          const normalized = (data.details.results || []).map((c) => ({
            ...c,
            _source: 'autocomplete',
          }));
          setClientes(normalized);
          console.log(
            `[useBuscarClientes] Clientes seteados: ${normalized.length}`
          );
        } else {
          console.warn('[useBuscarClientes] Respuesta sin éxito');
          setClientes([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[useBuscarClientes] Error de fetch:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchClientes, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
      console.log('[useBuscarClientes] Cleanup: cancelando fetch');
    };
  }, [dni, minLength]);

  // 🔹 Lookup: traer cliente completo por ID
  const fetchClienteById = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/clientes/search?id=${id}&mode=lookup`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.details.results.length > 0) {
        return { ...data.details.results[0], _source: 'lookup' };
      }
    } catch (err) {
      console.error('[useBuscarClientes:lookup] Error:', err);
    }
    return null;
  };

  return { clientes, loading, fetchClienteById };
}
