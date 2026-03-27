
"use client"

import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocalization } from "@/context/LocalizationContext"

export function LanguageToggle() {
  const { setLocale, locale } = useLocalization()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      aria-label="Toggle language"
      className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-90"
    >
      <Languages className="h-4.5 w-4.5" />
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
