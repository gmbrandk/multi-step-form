// hooks/useDropdown.js
import { useCallback, useEffect, useRef, useState } from 'react';

export function useDropdown({ onSelect, closeOnSelect = true } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  // 🔹 Alternar apertura
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // 🔹 Cerrar dropdown
  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // 🔹 Seleccionar un item
  const handleSelect = useCallback(
    (item, event) => {
      onSelect?.(item, event);
      if (closeOnSelect) close();
    },
    [onSelect, closeOnSelect, close]
  );

  // 🔹 Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // 🔹 Navegación con teclado (opcional)
  const handleKeyDown = useCallback(
    (e, items = []) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(items[activeIndex], e);
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [isOpen, activeIndex, handleSelect, close]
  );

  return {
    isOpen,
    toggle,
    open: () => setIsOpen(true),
    close,
    handleSelect,
    handleKeyDown,
    activeIndex,
    setActiveIndex,
    dropdownRef,
  };
}
