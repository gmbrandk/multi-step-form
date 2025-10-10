import { AutocompleteComponent } from './AutocompleteComponent';
import { useAutocomplete } from './useAutoComplete';

export function AutocompleteField({
  field,
  value,
  onChange,
  updateValue,
  values,
  readOnly,
}) {
  const {
    focused,
    setFocused,
    manualToggle,
    setManualToggle,
    uniqueSuggestions,
    shouldShowDropdown,
  } = useAutocomplete({ suggestions: field.suggestions });

  const showDropdown = shouldShowDropdown(field.showDropdown);

  return (
    <AutocompleteComponent
      id={field.name}
      label={field.label}
      placeholder={field.placeholder}
      value={value}
      disabled={readOnly || field.disabled}
      gridColumn={
        typeof field.gridColumn === 'function'
          ? field.gridColumn(values)
          : field.gridColumn
      }
      withToggle={field.withToggle}
      shouldShowDropdown={showDropdown}
      uniqueSuggestions={uniqueSuggestions}
      activeIndex={field.activeIndex}
      onChange={(e) => {
        onChange(field.name, e.target.value);
        field.onChange?.(e);
      }}
      onSelect={(item, e) => field.onSelect?.(item, e, updateValue, values)}
      onKeyDown={field.onKeyDown}
      onFocus={(e) => {
        setFocused(true);
        field.onFocus?.(e);
      }}
      onBlur={(e) => {
        setTimeout(() => setFocused(false), 150);
        field.onBlur?.(e);
        setManualToggle(false);
      }}
      onToggle={() => setManualToggle((prev) => !prev)}
      renderSuggestion={field.renderSuggestion}
      inputRef={field.inputRef}
    />
  );
}
