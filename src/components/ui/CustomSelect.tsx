'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder: string;
}

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder,
}: CustomSelectProps) {
  const [isCustom, setIsCustom] = useState(() => value && !options.includes(value));

  useEffect(() => {
    if (value && !options.includes(value)) {
      setIsCustom(true);
    } else {
      setIsCustom(false);
    }
  }, [value, options]);

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'custom') {
      setIsCustom(true);
      onChange(''); // Clear the value when switching to custom input
    } else {
      setIsCustom(false);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value && !options.includes(value)) {
      setIsCustom(false);
    }
  };

  if (isCustom) {
    return (
      <Input
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={`Enter custom ${placeholder.toLowerCase()}...`}
      />
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
        <SelectItem value="custom">Custom...</SelectItem>
      </SelectContent>
    </Select>
  );
}
