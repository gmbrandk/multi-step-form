import { useState } from 'react';
const baseFicha = {
  cpu: 'Ej: Intel Core i5-10400F',
  ram: 'Ej: 16GB DDR4 3200MHz',
  almacenamiento: 'Ej: 1TB SSD NVMe',
  gpu: 'Ej: NVIDIA GeForce RTX 3060',
};

export function StepFichaTecnica({ onChange }) {
  const [ficha, setFicha] = useState(
    Object.fromEntries(Object.keys(baseFicha).map((k) => [k, '']))
  );

  const handleChange = (field, value) => {
    const updated = { ...ficha, [field]: value };
    setFicha(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div>
      {Object.keys(baseFicha).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="sr-only">
            {field}
          </label>
          <input
            id={field}
            name={field}
            placeholder={baseFicha[field]}
            value={ficha[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}
