// components/forms/StepCliente.jsx
import { useOrdenServicioContext } from '../../context/OrdenServicioContext';
import { buildClienteFields } from '../../forms/clienteFormSchema';
import { useBuscarClientes } from '../../hooks/useBuscarClientes';
import { useClienteForm } from '../../hooks/useClienteForm';
import { SchemaForm } from './SchemaForm';

export function StepCliente() {
  const { orden, handleChangeOrden, resetClienteId } =
    useOrdenServicioContext();
  const cliente = orden.cliente || {};

  // hook para buscar clientes (API)
  const { clientes, fetchClienteById } = useBuscarClientes(cliente?.dni);

  // generamos fields + orden dinámico desde el schema
  const { fields: clienteFields, fieldOrder } = buildClienteFields({
    cliente,
    locked: Boolean(cliente?._id),
    suggestions: [],
    showDropdown: false,
    activeIndex: -1,
    dniBusqueda: cliente?.dni || '',
    handlers: {}, // se sobreescriben luego con useClienteForm
    fieldRefs: { current: {} },
  });

  // hook especializado en formulario
  const {
    dniBusqueda,
    showDropdown,
    suggestions,
    activeIndex,
    locked,
    fieldRefs,
    handlers,
    emailState, // 👈 añadimos emailState aquí
  } = useClienteForm({
    clienteInicial: cliente,
    handleChangeOrden,
    fetchClienteById,
    resetClienteId,
    clientes,
    isNew: !cliente?._id,
    fieldOrder, // 👈 lo pasamos desde el schema
  });

  // reconstruimos fields con los handlers reales del hook
  const { fields: finalFields } = buildClienteFields({
    cliente,
    locked,
    suggestions,
    showDropdown,
    activeIndex,
    dniBusqueda,
    handlers,
    fieldRefs,
    emailState, // 👈 también lo pasamos aquí
  });

  return (
    <SchemaForm
      values={cliente}
      onChange={(field, value) => {
        handleChangeOrden('cliente', { ...cliente, [field]: value });
      }}
      fields={finalFields}
      gridTemplateColumns="repeat(3, 1fr)"
      showDescriptions={false}
    />
  );
}
