
'use client';

import AnalystAgent from "@/components/file/AnalystAgent";
import { useLocalization } from "@/context/LocalizationContext";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { UploadManager } from "./UploadManager";

export default function FileManager() {
    const { t } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const { locale } = useLocalization();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            <div className={cn("lg:col-span-5 xl:col-span-4 h-full transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                <UploadManager />
            </div>
            <div className={cn("transition-all duration-300", isPanelCollapsed ? "lg:col-span-11 xl:col-span-11" : "lg:col-span-7 xl:col-span-8")}>
                <AnalystAgent />
            </div>
        </div>
    );
}
