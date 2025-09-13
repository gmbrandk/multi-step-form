import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { SchemaForm } from './SchemaForm';
// 🔹 Declaración de campos del cliente
const clienteFields = [
  {
    name: 'nombres',
    type: 'text',
    label: { name: 'Nombres', className: 'sr-only' },
    placeholder: 'Ej: Adriana Josefina',
    gridColumn: '1 / 4',
  },
  {
    name: 'apellidos',
    type: 'text',
    label: { name: 'Apellidos', className: 'sr-only' },
    placeholder: 'Ej: Tudela Gutiérrez',
    gridColumn: '1 / 4',
  },
  {
    name: 'dni',
    type: 'text',
    label: { name: 'DNI', className: 'sr-only' },
    placeholder: 'Ej: 45591954',
    gridColumn: '1 / 4',
  },
  {
    name: 'telefono',
    type: 'text',
    label: { name: 'Teléfono', className: 'sr-only' },
    placeholder: 'Ej: 913458768',
    gridColumn: '1 / 4',
  },
  {
    name: 'email',
    type: 'text',
    label: { name: 'Email', className: 'sr-only' },
    placeholder: 'Ej: ejemplo@correo.com',
    gridColumn: '1 / 4',
  },
  {
    name: 'direccion',
    type: 'text',
    label: { name: 'Dirección', className: 'sr-only' },
    placeholder: 'Ej: Av. Siempre Viva 742',
    gridColumn: '1 / 4',
  },
];

export function StepCliente() {
  const { orden, handleChangeOrden } = useOrdenServicioContext();

  return (
    <SchemaForm
      values={orden.cliente || {}} // 👈 leemos desde el Context
      onChange={(field, value) =>
        handleChangeOrden('cliente', {
          ...orden.cliente,
          [field]: value,
        })
      }
      fields={clienteFields}
      gridTemplateColumns="repeat(3, 1fr)"
      showDescriptions={false}
    />
  );
}
