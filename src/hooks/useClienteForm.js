import { useEmailSuggestions } from './subHooks/emailSuggestions';
import { useDniAutocomplete } from './subHooks/useDniAutocomplete';
import { useFormNavigation } from './subHooks/useFormNavigation';

/**
 * Hook especializado en formulario de Cliente
 * Orquesta sub-hooks sin ensuciarse con lógica de bajo nivel
 */
export function useClienteForm({
  clienteInicial,
  handleChangeOrden,
  fetchClienteById,
  resetClienteId,
  clientes,
}) {
  // 🚨 no pasamos fieldOrder aquí
  const navigation = useFormNavigation([]);

  const dni = useDniAutocomplete({
    clienteInicial,
    clientes,
    fetchClienteById,
    resetClienteId,
    handleChangeOrden,
    focusNextField: navigation.focusNextField,
  });

  const email = useEmailSuggestions({
    clienteInicial,
    handleChangeOrden,
    focusNextField: navigation.focusNextField,
  });

  const locked = Boolean(clienteInicial?._id);

  return {
    dni,
    email,
    navigation,
    locked,
    handleChangeOrden,
  };
}
