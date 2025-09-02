import { useState } from 'react';

const baseCliente = {
  nombres: 'Ej: Adriana Josefina',
  apellidos: 'Ej: Tudela Gutiérrez',
  dni: 'Ej: 45591954',
  telefono: 'Ej: 913458768',
  email: 'Ej: ejemplo@correo.com',
  direccion: 'Ej: Av. Siempre Viva 742',
};

export function Step1({ onChange }) {
  const [cliente, setCliente] = useState(
    Object.fromEntries(Object.keys(baseCliente).map((k) => [k, '']))
  );

  const handleChange = (field, value) => {
    const updated = { ...cliente, [field]: value };
    setCliente(updated);
    if (onChange) onChange(updated);
  };

  return (
    <>
      {Object.keys(baseCliente).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="sr-only">
            {field}
          </label>
          <input
            id={field}
            name={field}
            placeholder={baseCliente[field]}
            value={cliente[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      ))}
    </>
  );
}
