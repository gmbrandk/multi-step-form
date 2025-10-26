import { useCallback, useEffect, useState } from 'react';

export function useTiposTrabajo() {
  const [tiposTrabajo, setTiposTrabajo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTiposTrabajo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tipo-trabajo/`,
        { headers: { Accept: 'application/json' } }
      );

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

      const data = await res.json();
      console.log('🔎 Datos recibidos del backend:', data);

      const payload = Array.isArray(data)
        ? data
        : data.details || data.tiposTrabajo;

      if (!Array.isArray(payload))
        throw new Error('Respuesta inválida del servidor');

      // 🧩 Normalizamos para el frontend
      const mapped = payload.map((t) => ({
        value: t._id,
        label: t.nombre,
        tipo: t.tipo || 'general',
        precioBase: t.precioBase,
      }));

      setTiposTrabajo(mapped);
    } catch (err) {
      console.error('❌ Error cargando tipos de trabajo:', err);
      setError(err.message || 'Error desconocido');
      setTiposTrabajo([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiposTrabajo();
  }, [fetchTiposTrabajo]);

  return { tiposTrabajo, loading, error, refetch: fetchTiposTrabajo };
}
