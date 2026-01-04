
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "./scroll-area"

interface ComboboxProps {
    options: { value: string; label: string }[];
    value: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    isLoading?: boolean;
    allowCustomValue?: boolean;
}

export function Combobox({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select option...", 
    searchPlaceholder = "Search...", 
    isLoading = false,
    allowCustomValue = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || '');

  // Sync internal input value when the external value changes
  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onChange(newValue);
    setInputValue(newValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if(allowCustomValue) {
      onChange(newValue);
    }
  }

  const displayedLabel = isLoading 
    ? "Loading..." 
    : value 
        ? options.find((option) => option.value.toLowerCase() === value.toLowerCase())?.label || value
        : placeholder;

  if (allowCustomValue) {
      return (
          <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              list="combobox-options"
          />
      );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="truncate">{displayedLabel}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No options found.</CommandEmpty>
           <ScrollArea className="h-72">
            <CommandGroup>
                {options.map((option) => (
                <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {option.label}
                </CommandItem>
                ))}
            </CommandGroup>
           </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
