import { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      id,
      name,
      type = 'text',
      label,
      placeholder,
      value,
      disabled = false,
      readOnly = false,
      description,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      onPointerDown,
      onClick,
      onInput,
      style,
      classes = {}, // 🔹 Un solo objeto para todas las clases
      maxLength,
      inputMode,
      autoComplete = 'off',
    },
    ref
  ) => {
    const {
      root = '', // clase para el contenedor
      label: labelCls = '', // clase para el label
      input = '', // clase para el input
      description: descCls = '', // clase para la descripción
    } = classes;

    return (
      <div className={`input-wrapper ${root}`} style={style}>
        {/* 🔹 Etiqueta opcional */}
        {label && (
          <label
            htmlFor={id || name}
            className={`sr-only input-label ${labelCls}`}
          >
            {typeof label === 'string' ? label : label?.name}
          </label>
        )}

        {/* 🔹 Campo de texto real */}
        <input
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value ?? ''}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onPointerDown={onPointerDown}
          onClick={onClick}
          onInput={onInput}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={`input-field ${input}`} // combina base + personalizada
          ref={ref}
        />

        {/* 🔹 Descripción opcional */}
        {description && (
          <small className={`input-description ${descCls}`}>
            {description}
          </small>
        )}
      </div>
    );
  }
);
