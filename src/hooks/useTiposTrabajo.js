// hooks/useTiposTrabajo.js
import { useEffect, useState } from 'react';

export function useTiposTrabajo() {
  const [tiposTrabajo, setTiposTrabajo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tipo-trabajo/`
        );
        const data = await res.json();
        if (data?.success && Array.isArray(data.details)) {
          setTiposTrabajo(
            data.details.map((t) => ({
              value: t._id,
              label: t.nombre,
              tipo: t.tipo,
              precioBase: t.precioBase,
            }))
          );
        }
      } catch (err) {
        console.error('Error cargando tipos de trabajo:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { tiposTrabajo, loading };
}
