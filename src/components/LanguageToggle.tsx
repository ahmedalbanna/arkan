
"use client"

import * as React from "react"
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
    >
      <Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
