
'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { UploadManager } from "./UploadManager";
import AnalystAgent from "./AnalystAgent";
import { useLocalization } from "@/context/LocalizationContext";

export default function FileManager() {
  const { t } = useLocalization();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const { locale } = useLocalization();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {isPanelCollapsed && (
            <div className="hidden lg:block lg:col-span-1 sticky top-24">
                 <Button
                    variant="secondary"
                    className="h-auto p-2 rounded-l-none [writing-mode:vertical-lr] transform rotate-180"
                    onClick={() => setIsPanelCollapsed(false)}
                >
                    <PanelRightOpen className="h-5 w-5 mb-2" />
                    {t('builder.files.fileManagerTitle')}
                </Button>
            </div>
        )}
        <div className={cn("lg:col-span-5 xl:col-span-4 h-full transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
            <UploadManager onCollapseToggle={() => setIsPanelCollapsed(true)} />
        </div>
        <div className={cn("transition-all duration-300", isPanelCollapsed ? "lg:col-span-11 xl:col-span-11" : "lg:col-span-7 xl:col-span-8")}>
            <AnalystAgent />
        </div>
    </div>
  );
}
