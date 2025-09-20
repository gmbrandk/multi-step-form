import { useEffect, useState } from 'react';

export function useBuscarEquipos(nroSerie, minLength = 3) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Autocomplete (sugerencias por nroSerie)
  useEffect(() => {
    if (!nroSerie) {
      setEquipos([]);
      setLoading(false);
      return;
    }

    if (nroSerie.length < minLength) {
      setEquipos([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchEquipos = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/equipos/search?nroSerie=${nroSerie}&mode=autocomplete&limit=10`,
          {
            signal: controller.signal,
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data.success) {
          const normalized = (data.details.results || []).map((e) => ({
            ...e,
            _source: 'autocomplete',
          }));
          setEquipos(normalized);
        } else {
          setEquipos([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[useBuscarEquipos] Error de fetch:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchEquipos, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [nroSerie, minLength]);

  // 🔹 Lookup: traer equipo completo por ID (más seguro que nroSerie)
  const fetchEquipoById = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/equipos/search?id=${id}&mode=lookup`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.details.results.length > 0) {
        return { ...data.details.results[0], _source: 'lookup' };
      }
    } catch (err) {
      console.error('[useBuscarEquipos:lookup] Error:', err);
    }
    return null;
  };

  return { equipos, loading, fetchEquipoById };
}
