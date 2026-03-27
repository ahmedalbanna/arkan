"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/infrastructure/utils/cn"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-xs font-bold uppercase tracking-[0.2em] text-foreground/80",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-muted/20 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between mb-2",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-bold uppercase tracking-widest text-[9px] opacity-40",
        row: "flex w-full mt-1.5 justify-between",
        cell: cn(
          "h-10 w-10 text-center text-xs p-0 relative focus-within:relative focus-within:z-20 transition-all",
          "[&:has([aria-selected])]:bg-primary/5 [&:has([aria-selected])]:rounded-xl"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-semibold rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/20 scale-105",
        day_today: "bg-primary/10 text-primary ring-1 ring-primary/20",
        day_outside:
          "day-outside text-muted-foreground/40 aria-selected:bg-primary/5 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground/20",
        day_range_middle:
          "aria-selected:bg-primary/5 aria-selected:text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

