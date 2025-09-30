// forms/clienteFormSchema.js
export const buildClienteFields = ({
  cliente,
  locked,
  suggestions,
  showDropdown,
  activeIndex,
  dniBusqueda,
  handlers,
  fieldRefs,
}) => {
  const fields = [
    {
      name: 'dni',
      type: 'autocomplete',
      label: { name: 'DNI', className: 'sr-only' },
      placeholder: 'Ej: 45591954',
      gridColumn: '1 / 4',
      value: dniBusqueda,
      suggestions,
      showDropdown,
      activeIndex,
      onChange: handlers.handleDniChange,
      onSelect: handlers.handleSelectCliente,
      onKeyDown: handlers.handleKeyDownDni,
      onPointerDown: handlers.handleDniPointerDown,
      onFocus: handlers.handleDniFocus,
      onBlur: handlers.handleDniBlur,
      maxLength: 8,
      inputMode: 'numeric',
      disabled: false,
      inputRef: (el) => (fieldRefs.current['dni'] = el),
      renderSuggestion: (c) => (
        <div className="autocomplete-item">
          <span className="left-span">{c.dni}</span>
          <span className="right-span">
            {c.nombres} {c.apellidos}
          </span>
        </div>
      ),
    },
    {
      name: 'nombres',
      type: 'text',
      placeholder: 'Ej: Adriana Josefina',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: (el) => (fieldRefs.current['nombres'] = el),
    },
    {
      name: 'apellidos',
      type: 'text',
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: (el) => (fieldRefs.current['apellidos'] = el),
    },
    {
      name: 'telefono',
      type: 'text',
      placeholder: 'Ej: 913458768',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: (el) => (fieldRefs.current['telefono'] = el),
    },
    {
      name: 'email',
      type: 'text',
      placeholder: 'Ej: ejemplo@correo.com',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: (el) => (fieldRefs.current['email'] = el),
    },
    {
      name: 'direccion',
      type: 'text',
      placeholder: 'Ej: Av. Siempre Viva 742',
      gridColumn: '1 / 4',
      disabled: locked,
      inputRef: (el) => (fieldRefs.current['direccion'] = el),
    },
  ];

  return {
    fields,
    fieldOrder: fields.map((f) => f.name), // 👈 orden dinámico
  };
};
