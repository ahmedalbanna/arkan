
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/infrastructure/utils/cn"
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
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 px-4 rounded-xl border border-border/40 bg-muted/5 text-sm font-medium shadow-inner transition-all duration-300",
            "hover:border-primary/40 hover:bg-muted/10 focus:ring-1 focus:ring-primary/40 focus:bg-background",
            open && "border-primary/40 bg-background ring-1 ring-primary/40"
          )}
        >
          <span className="truncate text-foreground/80">{value ? options.find((option) => option.value === value)?.label || value : placeholder}</span>
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 ml-2">
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 overflow-hidden rounded-[20px] border border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <Command className="bg-transparent">
          <div className="p-2 border-b border-border/40 bg-muted/5">
            <CommandInput
                placeholder={searchPlaceholder}
                className="h-9 text-xs border-none bg-background shadow-inner focus:ring-0 rounded-lg"
            />
          </div>
          <CommandEmpty className="py-10 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">No nodes found</p>
          </CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup className="p-1.5">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  className="rounded-lg py-2.5 px-3 text-xs font-semibold data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-all duration-200 cursor-pointer"
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex h-4 w-4 items-center justify-center shrink-0">
                        <Check
                            className={cn(
                            "h-3.5 w-3.5 text-primary stroke-[3] transition-all duration-300",
                            value === option.value ? "opacity-100 scale-100" : "opacity-0 scale-50"
                            )}
                        />
                    </div>
                    <span className="truncate">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
