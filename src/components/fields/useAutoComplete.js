import { useMemo, useState } from 'react';

export function useAutocomplete({ suggestions = [] }) {
  const [focused, setFocused] = useState(false);
  const [manualToggle, setManualToggle] = useState(false);

  const uniqueSuggestions = useMemo(
    () =>
      suggestions.filter(
        (s, i, arr) =>
          i ===
          arr.findIndex((t) =>
            typeof s === 'string' ? t === s : t._id === s._id
          )
      ),
    [suggestions]
  );

  const shouldShowDropdown = (showDropdown) =>
    (showDropdown || manualToggle) && focused && uniqueSuggestions.length > 0;

  return {
    focused,
    setFocused,
    manualToggle,
    setManualToggle,
    uniqueSuggestions,
    shouldShowDropdown,
  };
}
