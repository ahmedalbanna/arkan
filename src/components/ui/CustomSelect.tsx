
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
  return (
    <Combobox
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search types..."
    />
  );
}
