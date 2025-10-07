export const buildEquipoFields = ({ equipo, locked, nroSerie, navigation }) => {
  if (!nroSerie || !navigation) {
    console.warn('buildEquipoFields: hooks incompletos');
    return { fields: [] };
  }

  const { state: nroSerieState, handlers: nroSerieHandlers } = nroSerie;
  const { fieldRefs, handlers: navHandlers } = navigation;

  const fields = [
    {
      name: 'nroSerie',
      type: 'autocomplete',
      label: { name: 'Nro. Serie', className: 'sr-only' },
      placeholder: 'Ej: 3BO52134Q',
      gridColumn: '1 / 4',
      value: nroSerieState.nroSerieBusqueda,
      suggestions: nroSerieState.suggestions,
      showDropdown: nroSerieState.showDropdown,
      activeIndex: nroSerieState.activeIndex,
      onChange: nroSerieHandlers.handleNroSerieChange,
      onSelect: nroSerieHandlers.handleSelectEquipo,
      onKeyDown: nroSerieHandlers.handleKeyDownNroSerie,
      onPointerDown: nroSerieHandlers.handleNroSeriePointerDown,
      onFocus: nroSerieHandlers.handleNroSerieFocus,
      onBlur: nroSerieHandlers.handleNroSerieBlur,
      disabled: false,
      inputRef: (el) => (fieldRefs.current['nroSerie'] = el),
      renderSuggestion: (eq) => (
        <div className="autocomplete-item">
          <span className="left-span">{eq.nroSerie}</span>
          <span className="right-span">{eq.marca}</span>
          <span className="right-span">{eq.modelo}</span>
        </div>
      ),
    },
    {
      name: 'tipo',
      type: 'text',
      placeholder: 'Ej: Laptop',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.tipo,
      inputRef: (el) => (fieldRefs.current['tipo'] = el),
    },
    {
      name: 'marca',
      type: 'text',
      placeholder: 'Ej: Toshiba',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.marca,
      inputRef: (el) => (fieldRefs.current['marca'] = el),
    },
    {
      name: 'modelo',
      type: 'text',
      placeholder: 'Ej: Satellite L45',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.modelo,
      inputRef: (el) => (fieldRefs.current['modelo'] = el),
    },
    {
      name: 'sku',
      type: 'text',
      placeholder: 'Ej: L45B4205FL',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.sku,
      inputRef: (el) => (fieldRefs.current['sku'] = el),
    },
    {
      name: 'macAddress',
      type: 'text',
      placeholder: 'Ej: FA:KE:28:08:25:03',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.macAddress,
      inputRef: (el) => (fieldRefs.current['macAddress'] = el),
    },
    {
      name: 'especificaciones',
      type: 'checkbox',
      className: 'fs-subtitle inline',
      label: { name: 'Agregar especificaciones de equipo' },
      gridColumn: '1 / 4',
      defaultValue: false,
      disabled: locked,
      inputRef: (el) => (fieldRefs.current['especificaciones'] = el),
    },
  ];

  return { fields, fieldOrder: fields.map((f) => f.name) };
};
