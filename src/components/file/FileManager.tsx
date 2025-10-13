
'use client';

import AnalystAgent from "@/components/file/AnalystAgent";
import { AnimatedContainer } from "@/components/ui/animation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { cn } from "@/lib/utils";
import { BrainCircuit, PanelRightOpen, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { UploadManager } from "./UploadManager";

export default function FileManager() {
    const { t } = useLocalization();
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const { locale } = useLocalization();

    return (
        <div className="relative h-full">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-full items-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {/* Collapsed Panel Button */}
                {isPanelCollapsed && (
                    <AnimatedContainer animation="fade-in-left" delay={0}>
                        <div className="hidden lg:block lg:col-span-1 sticky top-24">
                            <Card variant="glass" className="p-2 backdrop-blur-md">
                                <Button
                                    variant="secondary"
                                    className="h-auto p-3 rounded-lg w-full flex flex-col items-center gap-2 hover:shadow-glow transition-all duration-200"
                                    onClick={() => setIsPanelCollapsed(false)}
                                >
                                    <PanelRightOpen className="h-5 w-5" />
                                    <span className="text-xs font-medium text-center">
                                        {t('builder.files.fileManagerTitle')}
                                    </span>
                                </Button>
                            </Card>
                        </div>
                    </AnimatedContainer>
                )}

                {/* Upload Manager Section */}

                <div className={cn("lg:col-span-5 xl:col-span-4 h-full transition-all duration-300", isPanelCollapsed && "lg:hidden")}>
                    <AnimatedContainer animation="fade-in-up" delay={200}>
                        <Card variant="glass" className="h-full backdrop-blur-md">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">File Manager</h3>
                                        <p className="text-sm text-muted-foreground">Upload and manage your files</p>
                                    </div>
                                </div>
                                <UploadManager onCollapseToggle={() => setIsPanelCollapsed(true)} />
                            </div>
                        </Card>
                    </AnimatedContainer>
                </div>


                {/* Analyst Agent Section */}

                <div className={cn("transition-all duration-300", isPanelCollapsed ? "lg:col-span-11 xl:col-span-11" : "lg:col-span-7 xl:col-span-8")}>
                    <AnimatedContainer animation="fade-in-up" delay={400}>
                        <Card variant="glass" className="h-full backdrop-blur-md">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                                        <BrainCircuit className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">AI Analyst</h3>
                                        <p className="text-sm text-muted-foreground">Intelligent file analysis</p>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI-Powered
                                    </Badge>
                                </div>
                                <AnalystAgent />
                            </div>
                        </Card>
                    </AnimatedContainer>
                </div>

            </div>
        </div>
    );
}
