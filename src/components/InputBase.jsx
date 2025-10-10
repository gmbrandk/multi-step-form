// components/Input.jsx
import React, { forwardRef } from 'react';

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
      style,
      className = '',
      maxLength,
      inputMode,
    },
    ref
  ) => {
    return (
      <div className={`input-wrapper ${className}`} style={style}>
        {label && (
          <label htmlFor={id || name} className="input-label">
            {typeof label === 'string' ? label : label?.name}
          </label>
        )}

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
          maxLength={maxLength}
          inputMode={inputMode}
          ref={ref}
          className="input-field"
        />

        {description && (
          <small className="input-description">{description}</small>
        )}
      </div>
    );
  }
);
