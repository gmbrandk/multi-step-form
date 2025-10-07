import { useState } from 'react';
import prefijosTelefonicos from '../prefijosTelefonicos.json';

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

  // Estado interno del prefijo actual
  const [paisSeleccionado, setPaisSeleccionado] = useState({
    codigo: '+51',
    bandera: 'https://flagcdn.com/pe.svg',
    iso: 'PE',
    pais: 'Perú',
  });

  const handleSelectPais = (p) => {
    setPaisSeleccionado(p);
  };

  const fields = [
    // 🔹 DNI
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

    // 🔹 Nombres
    {
      name: 'nombres',
      type: 'text',
      placeholder: 'Ej: Adriana Josefina',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.nombres,
      inputRef: (el) => (fieldRefs.current['nombres'] = el),
    },

    // 🔹 Apellidos
    {
      name: 'apellidos',
      type: 'text',
      placeholder: 'Ej: Tudela Gutiérrez',
      gridColumn: '1 / 4',
      disabled: locked,
      onKeyDown: navHandlers.generic?.apellidos,
      inputRef: (el) => (fieldRefs.current['apellidos'] = el),
    },

    // 🔹 Teléfono con prefijo estilo Google
    {
      name: 'telefono',
      type: 'custom',
      gridColumn: '1 / 4',
      render: ({ value, onChange }) => {
        const [showDropdown, setShowDropdown] = useState(false);
        // 🔹 Cuando cambia el input
        const handleTelefonoChange = (e) => {
          const raw = e.target.value.replace(/\D/g, ''); // Solo números
          onChange(raw);
        };

        // 🔹 Valor completo (visual + prefijo)
        const telefonoCompleto = `${paisSeleccionado.codigo}${value || ''}`;
        return (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: '3px',
                overflow: 'hidden',
                background: 'white',
                marginBottom: '10px',
                padding: '15px',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'montserrat',
                color: '#2c3e50',
                fontSize: '13px',
              }}
            >
              {/* Prefijo + bandera */}
              <div
                onClick={() => setShowDropdown((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f9f9f9',
                  padding: '0 10px 0 0 ',
                  borderRight: '1px solid #ddd',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={paisSeleccionado.bandera}
                  alt={paisSeleccionado.pais}
                  width="20"
                  height="14"
                  style={{ borderRadius: '2px' }}
                />
                <span style={{ fontSize: '13px', color: '#333' }}>
                  {paisSeleccionado.codigo}
                </span>
              </div>

              {/* Input editable */}
              <input
                type="text"
                name="telefono"
                placeholder="Ej: 913458768"
                value={value || ''}
                onChange={handleTelefonoChange}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: 'none',
                  padding: '0 10px',
                  margin: '0',
                  outline: 'none',
                  fontSize: '13px',
                }}
                disabled={locked}
              />
            </div>

            {/* Dropdown de países */}
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100%)',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  zIndex: 2000,
                  fontFamily: 'montserrat, arial, sans-serif',
                }}
              >
                {prefijosTelefonicos.map((p, index) => (
                  <div
                    key={`${p.iso}-${p.codigo}-${index}`} // ✅ clave única
                    onClick={() => {
                      handleSelectPais(p);
                      setShowDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      background:
                        paisSeleccionado.iso === p.iso &&
                        paisSeleccionado.codigo === p.codigo
                          ? '#e8f0fe'
                          : 'white',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#f1f3f4')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        paisSeleccionado.iso === p.iso &&
                        paisSeleccionado.codigo === p.codigo
                          ? '#e8f0fe'
                          : 'white')
                    }
                  >
                    <img
                      src={p.bandera}
                      alt={p.pais}
                      width="20"
                      height="14"
                      style={{ borderRadius: '2px' }}
                    />
                    <span
                      style={{ flex: 1, fontWeight: 'bold', fontSize: '13px' }}
                    >
                      {p.pais}
                    </span>
                    <span style={{ color: '#2c3e50', fontSize: '13px' }}>
                      {p.codigo}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      },
    },

    // 🔹 Email
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
      onPointerDown: emailHandlers.toggleEmailDropdown, // 👈 se conecta aquí
      withToggle: true,
      renderSuggestion: (s) =>
        s === '__manual__' ? (
          <em className="email-span">Escribir manualmente</em>
        ) : (
          <span className="email-span">{s}</span>
        ),
    },
    // 🔹 Dirección
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
