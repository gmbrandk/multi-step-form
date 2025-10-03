export const buildClienteFields = ({
  cliente,
  locked,
  dni,
  email,
  navigation,
}) => {
  if (!dni || !email || !navigation) {
    console.warn('buildClienteFields: hooks incompletos');
    return { fields: [] };
  }

  const { state: dniState, handlers: dniHandlers } = dni;
  const { state: emailState, handlers: emailHandlers } = email;
  const { fieldRefs, handlers: navHandlers } = navigation;

  const fields = [
    {
      name: 'dni',
      type: 'autocomplete',
      label: { name: 'DNI', className: 'sr-only' },
      placeholder: 'Ej: 45591954',
      gridColumn: '1 / 4',
      value: dniState.dniBusqueda,
      suggestions: dniState.suggestions,
      showDropdown: dniState.showDropdown,
      activeIndex: dniState.activeIndex,
      onChange: dniHandlers.handleDniChange,
      onSelect: dniHandlers.handleSelectCliente,
      onKeyDown: dniHandlers.handleKeyDownDni,
      onPointerDown: dniHandlers.handleDniPointerDown,
      onFocus: dniHandlers.handleDniFocus,
      onBlur: dniHandlers.handleDniBlur,
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
      onKeyDown: navHandlers.generic?.nombres,
      inputRef: (el) => (fieldRefs.current['nombres'] = el),
    },
    {
      name: 'apellidos',
      type: 'text',
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.apellidos,
      inputRef: (el) => (fieldRefs.current['apellidos'] = el),
    },
    {
      name: 'telefono',
      type: 'text',
      placeholder: 'Ej: 913458768',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.telefono,
      inputRef: (el) => (fieldRefs.current['telefono'] = el),
    },
    {
      name: 'email',
      type: 'autocomplete',
      label: { name: 'Email', className: 'sr-only' },
      placeholder: 'Ej: ejemplo@correo.com',
      gridColumn: '1 / 4',
      disabled: locked,
      suggestions: emailState.emailSuggestions,
      showDropdown: emailState.showEmailDropdown,
      activeIndex: emailState.activeEmailIndex,
      onFocus: emailHandlers.handleEmailFocus,
      onBlur: emailHandlers.handleEmailBlur,
      onKeyDown: emailHandlers.handleKeyDownEmail,
      onSelect: emailHandlers.handleEmailSelect,
      inputRef: (el) => (fieldRefs.current['email'] = el),
      withToggle: true,
      renderSuggestion: (s) =>
        s === '__manual__' ? (
          <em className="email-span">Escribir manualmente</em>
        ) : (
          <span className="email-span">{s}</span>
        ),
    },
    {
      name: 'direccion',
      type: 'text',
      placeholder: 'Ej: Av. Siempre Viva 742',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.direccion,
      inputRef: (el) => (fieldRefs.current['direccion'] = el),
    },
  ];

  return { fields, fieldOrder: fields.map((f) => f.name) };
};
