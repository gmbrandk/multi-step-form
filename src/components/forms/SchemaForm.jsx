import { memo } from 'react';
import { AutocompleteField } from '../fields/AutocompleteField';
import { TelefonoField } from '../fields/TelefonoFIeld';
import { Input } from '../InputBase';

export const SchemaForm = memo(function SchemaForm({
  values = {},
  onChange,
  fields = [],
  gridTemplateColumns = 'repeat(3, 1fr)',
  showDescriptions = true,
  readOnly = false,
  isFallback = false, // 👈 estado global de carga / error
  fallbackMessage = '⚙️ Cargando datos...', // 👈 mensaje configurable
  onRetry, // 👈 (opcional) para reintentar carga
}) {
  if (!fields.length) return null;

  // ====================================================
  // Utilidades internas
  // ====================================================
  const resolveValue = (field, values) => {
    const v = values[field.name];
    const isEmpty = v === undefined || v === null || v === '';
    return isEmpty ? field.defaultValue ?? '' : v;
  };

  const updateValue = (name, newValue) => {
    if (typeof onChange === 'function') {
      const field = fields.find((f) => f.name === name);
      const editable = !isFallback || field?.localEditable;
      if (editable) onChange(name, newValue);
    }
  };

  const attachRef = (field, idx) => {
    return (el) => {
      if (typeof field.inputRef === 'function') {
        field.inputRef(el);
      } else if (field.inputRef && 'current' in field.inputRef) {
        field.inputRef.current = el;
      }
    };
  };

  // ====================================================
  // Estilos shimmer (modo fallback)
  // ====================================================
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.2s ease-in-out infinite',
  };

  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  // ====================================================
  // Render principal
  // ====================================================
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns,
          columnGap: '8px',
        }}
      >
        {fields.map((field, idx) => {
          const { name, type, label, className } = field;

          if (field.visibleWhen && !field.visibleWhen(values)) return null;

          const column =
            typeof field.gridColumn === 'function'
              ? field.gridColumn(values)
              : field.gridColumn;

          const value = resolveValue(field, values);

          // 🔒 Durante fallback deshabilitamos TODO (sin excepción)
          const disabled = readOnly || field.disabled || isFallback;

          // ⚡ Estilo shimmer visual
          const commonFallback = isFallback
            ? {
                ...shimmerStyle,
                borderRadius: '4px',
                color: '#999',
                cursor: 'not-allowed',
              }
            : {};

          // ====================================================
          // Render por tipo de campo
          // ====================================================

          // ✅ Autocomplete
          if (type === 'autocomplete') {
            return (
              <AutocompleteField
                key={name}
                value={value}
                onChange={(v) => updateValue(name, v)}
                {...field.props}
                gridColumn={column}
                disabled={disabled}
              />
            );
          }

          // ✅ Custom render
          if (type === 'custom') {
            return (
              <div key={name} style={{ gridColumn: column }}>
                {field.render({
                  value,
                  onChange: (v) => updateValue(name, v),
                  values,
                  updateValue,
                  isFallback,
                })}
              </div>
            );
          }

          // ✅ Teléfono
          if (type === 'telefono') {
            return (
              <TelefonoField
                key={name}
                value={value}
                onChange={(v) => updateValue(name, v)}
                {...field.props}
                gridColumn={column}
                disabled={disabled}
              />
            );
          }

          // ✅ Checkbox
          if (type === 'checkbox') {
            return (
              <div
                key={name}
                className={className}
                style={{
                  gridColumn: column || '1 / -1',
                  justifySelf: 'center',
                  alignSelf: 'center',
                }}
              >
                <label htmlFor={name} className={label?.className}>
                  <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={!!value}
                    disabled={disabled}
                    onChange={(e) => updateValue(name, e.target.checked)}
                    ref={attachRef(field, idx)}
                    className="input-field"
                  />
                  <span>{label?.name || label}</span>
                </label>
              </div>
            );
          }

          // ✅ Select
          if (type === 'select') {
            return (
              <div
                key={name}
                className={`input-container ${
                  disabled ? 'input-disabled' : ''
                } ${isFallback && !field.localEditable ? 'loading' : ''}`}
                style={{ gridColumn: column }}
              >
                <label htmlFor={name} className={label?.className}>
                  {label?.name || label}
                </label>
                {isFallback && !field.localEditable ? (
                  <div style={{ height: '38px', ...commonFallback }} />
                ) : (
                  <select
                    id={name}
                    name={name}
                    className="input-field"
                    value={value}
                    disabled={disabled}
                    onChange={(e) => updateValue(name, e.target.value)}
                    ref={attachRef(field, idx)}
                  >
                    <option value="">
                      {field.placeholder || 'Selecciona...'}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          }

          // ✅ Textarea
          if (type === 'textarea') {
            return (
              <div
                key={name}
                className={`input-container ${
                  disabled ? 'input-disabled' : ''
                } ${isFallback && !field.localEditable ? 'loading' : ''}`}
                style={{ gridColumn: column }}
              >
                <label htmlFor={name} className={label?.className}>
                  {label?.name || label}
                </label>
                {isFallback && !field.localEditable ? (
                  <div
                    className="input-field"
                    style={{ height: '60px', ...commonFallback }}
                  />
                ) : (
                  <textarea
                    id={name}
                    name={name}
                    className="input-field"
                    placeholder={field.placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => updateValue(name, e.target.value)}
                    style={{ width: '100%', minHeight: '60px' }}
                    ref={attachRef(field, idx)}
                  />
                )}
              </div>
            );
          }

          // ✅ Output
          if (type === 'output') {
            return (
              <div
                key={name}
                className={`input-container ${
                  disabled ? 'input-disabled' : ''
                }`}
                style={{ gridColumn: column }}
              >
                <label htmlFor={name} className={label?.className}>
                  {label?.name || label}
                </label>
                <output
                  id={name}
                  name={name}
                  className="input-field"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    background: '#eee',
                  }}
                >
                  {value}
                </output>
              </div>
            );
          }

          // ✅ Input estándar
          return (
            <div
              key={name}
              className={`input-container ${disabled ? 'input-disabled' : ''} ${
                isFallback && !field.localEditable ? 'loading' : ''
              }`}
              style={{ gridColumn: column }}
            >
              <Input
                id={name}
                name={name}
                type={type || 'text'}
                label={label?.name || label}
                value={value}
                placeholder={isFallback ? fallbackMessage : field.placeholder}
                disabled={disabled}
                onChange={(e) => updateValue(name, e.target.value)}
                ref={attachRef(field, idx)}
                className="input-field"
              />
            </div>
          );
        })}
      </div>

      {/* 👇 Área opcional para fallback con retry */}
      {isFallback && onRetry && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: '#999' }}>{fallbackMessage}</p>
          <button onClick={onRetry} style={{ padding: '6px 12px' }}>
            🔄 Reintentar
          </button>
        </div>
      )}
    </>
  );
});
