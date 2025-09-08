import { useCallback, useMemo } from 'react';

const baseLinea = {
  tipoTrabajo: '',
  nombreTrabajo: '',
  descripcion: '',
  precioUnitario: 0,
  cantidad: 1,
  subTotal: 0,
  categoria: '', // se resolverá con defaultValue o 'servicio'
};

/**
 * @param {object} linea        valores que vienen del padre
 * @param {function} onChange   callback (field, value)
 * @param {object} fieldConfig  { [fieldName]: { defaultValue?: any } }
 */
export function useLineaServicio(linea = {}, onChange, fieldConfig = {}) {
  // 1) Mapa de defaults desde fieldConfig
  const defaultsFromConfig = useMemo(() => {
    return Object.fromEntries(
      Object.entries(fieldConfig).map(([key, cfg]) => [key, cfg?.defaultValue])
    );
  }, [fieldConfig]);

  // 2) Limpiamos valores vacíos del objeto de entrada (no pisan defaults)
  const cleanedLinea = useMemo(() => {
    return Object.fromEntries(
      Object.entries(linea).filter(
        ([, v]) => v !== '' && v !== null && v !== undefined
      )
    );
  }, [linea]);

  // 3) Merge final: base → defaults de config → valores (limpios)
  const mergedLinea = useMemo(() => {
    const merged = {
      ...baseLinea,
      ...defaultsFromConfig,
      ...cleanedLinea,
    };

    // ⚠️ asegurar categoria con un valor válido desde el inicio
    if (!merged.categoria || merged.categoria === '') {
      merged.categoria = defaultsFromConfig.categoria ?? 'servicio';
    }

    // Normalizar tipos numéricos
    merged.cantidad = Number(merged.cantidad ?? 1);
    merged.precioUnitario = Number(merged.precioUnitario ?? 0);

    // subTotal derivado (no obligatorio, pero útil como valor inicial)
    merged.subTotal = merged.cantidad * merged.precioUnitario;

    if (process.env.NODE_ENV === 'development') {
      // Debug de arranque
      // console.log('[useLineaServicio.merged]', { linea, defaultsFromConfig, cleanedLinea, merged });
    }

    return merged;
  }, [defaultsFromConfig, cleanedLinea]);

  // 4) Handle change: reporta el campo individual; recalcula subTotal cuando aplique
  const handleChange = useCallback(
    (field, value) => {
      if (!onChange) return;

      onChange(field, value);

      if (field === 'cantidad' || field === 'precioUnitario') {
        const cantidad =
          field === 'cantidad'
            ? Number(value) || 0
            : Number(mergedLinea.cantidad) || 0;

        const precio =
          field === 'precioUnitario'
            ? Number(value) || 0
            : Number(mergedLinea.precioUnitario) || 0;

        onChange('subTotal', cantidad * precio);
      }
    },
    [onChange, mergedLinea.cantidad, mergedLinea.precioUnitario]
  );

  return { linea: mergedLinea, handleChange };
}
