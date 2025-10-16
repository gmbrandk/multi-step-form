import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Input } from '../InputBase';
import { useDropdown } from './useDropdown';

const BANDERA_NEUTRAL =
  'https://upload.wikimedia.org/wikipedia/commons/d/d4/World_Flag_%282004%29.svg';

export function TelefonoField({
  value = '',
  onChange,
  locked,
  paisSeleccionado,
  prefijosTelefonicos = [],
  handleSelectPais,
  navHandlers,
  fieldRefs,
  maxLength,
  gridColumn = '1 / 4',
}) {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const pendingCursorRef = useRef(null);

  const [bandera, setBandera] = useState(
    paisSeleccionado?.bandera || BANDERA_NEUTRAL
  );
  const [displayValue, setDisplayValue] = useState('');

  // 🔹 Inicialización del hook useDropdown
  const { isOpen, toggle, handleSelect } = useDropdown({
    onSelect: (p) => {
      console.groupCollapsed(
        '%c📍 [Dropdown] País seleccionado',
        'color:#ff9800;'
      );
      console.log('🌎 País:', p.pais);
      console.log('📞 Código:', p.codigo);
      console.log('🏁 Bandera:', p.bandera);
      console.groupEnd();

      handleSelectPais(p);
      setBandera(p.bandera);

      const numero = String(value || '').replace(/\D/g, '');
      const nuevoDisplay = numero ? `${p.codigo} ${numero}` : p.codigo;
      console.log('🧩 Nuevo display por selección:', nuevoDisplay);
      setDisplayValue(nuevoDisplay);
    },
  });

  // 🔹 Agregamos log al abrir/cerrar dropdown
  const handleToggleDropdown = () => {
    const nuevoEstado = !isOpen ? '🟢 Abierto' : '🔴 Cerrado';
    console.groupCollapsed('%c📂 [Dropdown] Toggle', 'color:#2196f3;');
    console.log(`Estado actual: ${nuevoEstado}`);
    console.log('Bloqueado:', locked);
    console.groupEnd();

    if (!locked) toggle();
  };

  // 🔹 Detectar país por prefijo
  const detectarPaisPorPrefijo = (texto) => {
    const limpio = texto.replace(/\s/g, '');
    const sorted = prefijosTelefonicos
      .slice()
      .sort((a, b) => b.codigo.length - a.codigo.length);
    const match = sorted.find((p) => limpio.startsWith(p.codigo)) || null;
    if (match)
      console.log('🌍 Prefijo detectado:', match.codigo, '-', match.pais);
    else console.log('❓ Prefijo no reconocido');
    return match;
  };

  // 🔹 Control de escritura
  const handleInputChange = (e) => {
    const input = e.target;
    const raw = input.value;

    console.groupCollapsed('%c✏️ [handleInputChange]', 'color: #03a9f4;');
    console.log('Valor digitado:', raw);

    // Solo permitir +, dígitos y espacios
    if (!/^[\+\d\s]*$/.test(raw)) {
      console.warn('❌ Caracter inválido detectado, se ignora.');
      console.groupEnd();
      return;
    }

    const cursorPos = input.selectionStart ?? null;
    pendingCursorRef.current = cursorPos;
    setDisplayValue(raw);

    // Vacío o solo "+"
    if (raw.trim() === '' || raw === '+') {
      console.log('🧹 Reset: campo vacío o solo +');
      setBandera(BANDERA_NEUTRAL);
      handleSelectPais({
        codigo: '+',
        pais: 'Desconocido',
        bandera: BANDERA_NEUTRAL,
        iso: '??',
      });
      onChange?.('');
      console.groupEnd();
      return;
    }

    // Detectar país
    const match = detectarPaisPorPrefijo(raw);
    if (match && match.iso !== paisSeleccionado?.iso) {
      console.log('🔁 Cambio de país detectado:', match.pais);
      handleSelectPais(match);
      setBandera(match.bandera);
    } else if (raw.startsWith('+') && !match) {
      console.warn('⚠️ Prefijo desconocido, bandera neutral');
      setBandera(BANDERA_NEUTRAL);
      handleSelectPais({
        codigo: raw.split(/\s/)[0],
        pais: 'Desconocido',
        bandera: BANDERA_NEUTRAL,
        iso: '??',
      });
    }

    // Extraer número local correctamente según el prefijo real
    let numeroLocal = raw;
    const prefijoActual = match?.codigo || paisSeleccionado?.codigo || '+';
    if (numeroLocal.startsWith(prefijoActual)) {
      numeroLocal = numeroLocal.slice(prefijoActual.length);
    }
    numeroLocal = numeroLocal.replace(/\D/g, '');
    console.log('📞 Número local extraído (corrigido):', numeroLocal);

    console.groupEnd();
  };

  // 🔹 Restaurar posición del cursor tras render
  useLayoutEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos == null) return;
    const el = inputRef.current;
    if (!el) {
      pendingCursorRef.current = null;
      return;
    }
    try {
      const safePos = Math.max(0, Math.min(pos, el.value.length));
      el.setSelectionRange(safePos, safePos);
      console.log('🪄 Cursor restaurado en posición:', safePos);
    } catch (err) {
      console.warn('⚠️ No se pudo restaurar cursor:', err);
    }
    pendingCursorRef.current = null;
  }, [displayValue]);

  // 🔹 Sincronizar visual desde backend
  useEffect(() => {
    console.groupCollapsed('%c📦 [Sync desde backend]', 'color: #4caf50;');
    console.log('🔸 Valor del backend:', value);
    console.log(
      '🌍 País actual:',
      paisSeleccionado?.pais,
      paisSeleccionado?.codigo
    );

    const limpio = String(value || '').replace(/\s+/g, '');
    const matchBackend = detectarPaisPorPrefijo(limpio);
    const codigoActual = paisSeleccionado?.codigo || '+';

    let nuevoValor = '';

    if (!value) {
      // 🧹 Caso 2️⃣: Sin valor → solo prefijo local
      nuevoValor = codigoActual;
      console.log('🧹 Backend vacío, se muestra solo el prefijo local.');
    } else if (matchBackend && matchBackend.codigo !== codigoActual) {
      // 🌍 Caso 3️⃣: El número es de otro país
      console.log(
        `⚠️ Prefijo backend distinto (${matchBackend.codigo}), se respeta el original.`
      );
      nuevoValor = value; // Mantener tal cual vino del backend
      handleSelectPais(matchBackend); // ✅ Cambiar bandera automáticamente
      setBandera(matchBackend.bandera);
    } else {
      // ✅ Caso 1️⃣: Prefijo coincide o no tiene → usar código local
      let numeroSolo = limpio;
      if (numeroSolo.startsWith(codigoActual)) {
        numeroSolo = numeroSolo.slice(codigoActual.length);
      }
      numeroSolo = numeroSolo.replace(/\D/g, '');
      nuevoValor = numeroSolo ? `${codigoActual} ${numeroSolo}` : codigoActual;
    }

    const el = inputRef.current;
    const isFocused = el === document.activeElement;

    setBandera(paisSeleccionado?.bandera || BANDERA_NEUTRAL);

    if (isFocused) {
      console.log('✋ Usuario escribiendo, no se actualiza visual.');
      console.groupEnd();
      return;
    }

    console.log('✅ Actualizando displayValue a:', nuevoValor);
    setDisplayValue((prev) => (prev !== nuevoValor ? nuevoValor : prev));
    console.groupEnd();
  }, [value, paisSeleccionado]);

  // 🔹 Formatear automáticamente al perder el foco
  const handleBlur = () => {
    console.groupCollapsed('%c💅 [onBlur → Formato final]', 'color:#9c27b0;');
    console.log('Valor antes de formatear:', displayValue);

    const limpio = displayValue.replace(/\s+/g, '');
    const match = detectarPaisPorPrefijo(limpio);
    const codigo = match?.codigo || paisSeleccionado?.codigo || '+';

    // ✅ Extraer el número local eliminando exactamente el prefijo detectado
    let numero = limpio;
    if (numero.startsWith(codigo)) {
      numero = numero.slice(codigo.length);
    }
    numero = numero.replace(/\D/g, '');

    const nuevoDisplay = numero ? `${codigo} ${numero}` : codigo;

    console.log('📱 Formato aplicado:', nuevoDisplay);
    setDisplayValue(nuevoDisplay);
    console.groupEnd();
  };

  // 🔹 Registrar referencia
  useEffect(() => {
    if (fieldRefs?.current) {
      fieldRefs.current['telefono'] = inputRef.current;
      console.log('📇 Campo teléfono registrado en refs.');
    }
  }, [fieldRefs]);

  useEffect(() => {
    console.groupCollapsed('%c🌐 [Dropdown Render]', 'color:#8bc34a;');
    console.log('Total de países cargados:', prefijosTelefonicos.length);
    console.log('Dropdown abierto:', isOpen);
    if (isOpen) {
      console.table(
        prefijosTelefonicos.map((p) => ({
          país: p.pais,
          código: p.codigo,
          iso: p.iso,
        }))
      );
    }
    console.groupEnd();
  }, [isOpen, prefijosTelefonicos]);

  return (
    <div className="telefono-wrapper" style={{ gridColumn }} ref={dropdownRef}>
      <div className={`telefono-container ${locked ? 'disabled' : ''}`}>
        <div
          className={`telefono-prefix ${locked ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // 🛑 evita que el click llegue al listener global
            if (!locked) toggle();
          }}
        >
          <img
            src={bandera}
            alt={paisSeleccionado?.pais || 'País'}
            aria-label={`Bandera de ${paisSeleccionado?.pais || 'desconocido'}`}
            role="img"
            style={{ transition: 'opacity 0.3s ease' }}
          />
        </div>

        <Input
          ref={inputRef}
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={`${paisSeleccionado?.codigo || '+'}9xxxxxxx`}
          disabled={locked}
          maxLength={maxLength || 20}
          onKeyDown={navHandlers?.generic?.telefono}
          classes={{ input: 'telefono-input' }}
          style={{
            border: 'none',
            background: 'transparent',
          }}
        />
      </div>

      {isOpen && (
        <div className="telefono-dropdown">
          {prefijosTelefonicos.map((p, i) => (
            <div
              key={`${p.iso}-${i}`}
              className="telefono-item"
              onClick={(e) => {
                console.groupCollapsed(
                  '%c🖱️ [TelefonoField.dropdownItemClick]',
                  'color:#9c27b0;'
                );
                console.log('Item clickeado:', p);
                console.log('Evento:', e.type);
                console.groupEnd();
                handleSelect(p, e);
              }}
            >
              <img src={p.bandera} alt={p.pais} />
              <span className="telefono-pais">{p.pais}</span>
              <span className="telefono-codigo">{p.codigo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
