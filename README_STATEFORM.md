# 🧭 Manual de Uso — Estados Extendidos de Formularios (`SchemaForm`)

## 📘 Contexto

A partir de esta versión, todos los formularios que usan `SchemaForm` y los _builders_ (`buildOrdenServicioFields`, `buildClienteFields`, etc.) soportan **dos estados adicionales de carga y error**:  
`isFallback` y `fallbackMessage`.

Estos estados permiten **mantener la estructura del formulario intacta** incluso cuando el backend está lento o inaccesible, mostrando mensajes visuales amigables sin romper el flujo del wizard.

---

## ⚙️ Props extendidos

| Propiedad         | Tipo      | Descripción                                                                                                         |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `isFallback`      | `boolean` | Indica que el formulario está en un estado seguro (cargando o error). Los campos se renderizan pero deshabilitados. |
| `fallbackMessage` | `string`  | Texto que explica al usuario qué está ocurriendo. Se usa como placeholder o mensaje interno.                        |

---

## 🧱 Ejemplo básico de uso en un Step

```jsx
import { SchemaForm } from './SchemaForm';
import { useTiposTrabajo } from '../../hooks/useTiposTrabajo';
import { buildOrdenServicioFields } from '../../forms/ordenServicioFormSchema';

export function StepOrdenServicio() {
  const { tiposTrabajo, loading, error } = useTiposTrabajo();
  const linea = { tipo: '', tipoTrabajo: '' };

  const fields = buildOrdenServicioFields({
    linea,
    tiposTrabajo,
    isFallback: loading || error,
    fallbackMessage: error
      ? '⚠️ Error al conectar con el servidor'
      : '⏳ Cargando tipos de trabajo...',
  });

  return (
    <SchemaForm
      values={linea}
      onChange={() => {}}
      fields={fields}
      isFallback={loading || error}
      fallbackMessage={
        error
          ? '⚠️ Error al conectar con el servidor'
          : 'Cargando tipos de trabajo...'
      }
    />
  );
}
```

// forms/ordenServicioFormSchema.js
export function buildOrdenServicioFields({ linea, tiposTrabajo, isFallback, fallbackMessage }) {
const tiposUnicos = isFallback
? [{ value: '', label: fallbackMessage || 'Cargando tipos...' }]
: [...new Set(tiposTrabajo.map((t) => t.tipo))].map((tipo) => ({
value: tipo,
label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
}));

const trabajosFiltrados = isFallback
? [{ value: '', label: fallbackMessage || 'Esperando datos...' }]
: tiposTrabajo
.filter((t) => t.tipo === linea.tipo)
.map((t) => ({ value: t.value, label: t.label }));

return [
{
name: 'tipo',
type: 'select',
label: { name: 'Tipo', className: 'sr-only' },
gridColumn: '1 / 4',
options: tiposUnicos,
disabled: isFallback,
},
{
name: 'tipoTrabajo',
type: 'select',
label: { name: 'Tipo de Trabajo', className: 'sr-only' },
gridColumn: '1 / 4',
options: trabajosFiltrados,
disabled: isFallback,
},
{
name: 'descripcion',
type: 'textarea',
placeholder: isFallback
? fallbackMessage
: 'Ej: Limpieza interna y chequeo de hardware',
readOnly: isFallback,
gridColumn: '1 / 4',
},
];
}
