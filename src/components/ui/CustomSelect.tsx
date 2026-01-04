
'use client';

import { Combobox } from './combobox';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder,
}: CustomSelectProps) {

  // This component now uses the more advanced Combobox component internally.
  // The logic for switching between a select and an input has been moved there
  // to create a unified, searchable, and free-text-supporting dropdown.
  return (
    <Combobox
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search types..."
        allowCustomValue={true} // This is the key change to allow free text
    />
  );
}
