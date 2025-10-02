export const buildClienteFields = ({
  cliente,
  locked,
  suggestions,
  showDropdown,
  activeIndex,
  dniBusqueda,
  handlers,
  fieldRefs,

  // 👇 añadimos emailState que devuelve el hook
  emailState = {},
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
      onKeyDown: handlers.generic?.nombres, // 👈 ahora limpio
      inputRef: (el) => (fieldRefs.current['nombres'] = el),
    },
    {
      name: 'apellidos',
      type: 'text',
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: handlers.generic?.apellidos, // 👈
      inputRef: (el) => (fieldRefs.current['apellidos'] = el),
    },
    {
      name: 'telefono',
      type: 'text',
      placeholder: 'Ej: 913458768',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: handlers.generic?.telefono, // 👈
      inputRef: (el) => (fieldRefs.current['telefono'] = el),
    },
    {
      name: 'email',
      type: 'autocomplete',
      label: { name: 'Email', className: 'sr-only' },
      placeholder: 'Ej: ejemplo@correo.com',
      gridColumn: '1 / 4',
      disabled: locked,
      suggestions: emailState.emailSuggestions || [],
      showDropdown: emailState.showEmailDropdown || false,
      activeIndex: emailState.activeEmailIndex ?? -1,
      onFocus: handlers.handleEmailFocus,
      onBlur: handlers.handleEmailBlur,
      onKeyDown: handlers.handleKeyDownEmail,
      onSelect: handlers.handleEmailSelect,
      inputRef: (el) => (fieldRefs.current['email'] = el),
      withToggle: true, // 👈 SOLO AQUÍ
      renderSuggestion: (s) => (
        <div className="autocomplete-item">
          {s === '__manual__' ? <em>Escribir manualmente</em> : s}
        </div>
      ),
    },
    {
      name: 'direccion',
      type: 'text',
      placeholder: 'Ej: Av. Siempre Viva 742',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: handlers.generic?.direccion, // 👈
      inputRef: (el) => (fieldRefs.current['direccion'] = el),
    },
  ];

  return {
    fields,
    fieldOrder: fields.map((f) => f.name),
  };
};
