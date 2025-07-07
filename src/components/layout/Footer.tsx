'use client';

import { useLocalization } from "@/context/LocalizationContext";

export function Footer() {
  const { t } = useLocalization();
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
        </p>
      </div>
    </footer>
  );
}
