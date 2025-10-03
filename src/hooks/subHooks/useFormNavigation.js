import { useCallback, useRef, useState } from 'react';

export function useFormNavigation(initialOrder = []) {
  const fieldRefs = useRef({});
  const [fieldOrder, setFieldOrderState] = useState(initialOrder);

  // Setter seguro (ignora arrays iguales)
  const setFieldOrder = useCallback(
    (newOrder) => {
      const oldOrder = fieldOrder;
      if (
        oldOrder.length !== newOrder.length ||
        oldOrder.some((v, i) => v !== newOrder[i])
      ) {
        setFieldOrderState(newOrder);
      }
    },
    [fieldOrder]
  );

  const focusNextField = (currentName) => {
    console.log('[focusNextField] current=', currentName, 'order=', fieldOrder);
    const index = fieldOrder.indexOf(currentName);
    if (index >= 0 && index < fieldOrder.length - 1) {
      const nextName = fieldOrder[index + 1];
      const nextField = fieldRefs.current[nextName];
      if (nextField) {
        nextField.focus();
      }
    }
  };

  const handleGenericKeyDown = (fieldName) => (e) => {
    console.log(`[handleGenericKeyDown] field=${fieldName}, key=${e.key}`);
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextField(fieldName);
    }
  };

  const genericHandlers = new Proxy(
    {},
    { get: (_, fieldName) => handleGenericKeyDown(fieldName) }
  );

  return {
    fieldRefs,
    fieldOrder,
    setFieldOrder, // 👈 blindado
    focusNextField,
    handlers: { generic: genericHandlers },
  };
}
