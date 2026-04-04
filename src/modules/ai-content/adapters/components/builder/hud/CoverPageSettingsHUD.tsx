'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoverPageHUD } from '../settings/CoverPageHUD';

interface CoverPageSettingsHUDProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CoverPageSettingsHUD: React.FC<CoverPageSettingsHUDProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-20 right-8 z-[40] w-80 max-h-[calc(100vh-12rem)]"
                >
                    <div className="relative bg-background/80 backdrop-blur-3xl border border-primary/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Technical HUD Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/5">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Cover Manifest</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-6 w-6 rounded-full hover:bg-primary/10 text-muted-foreground transition-all"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>

                        {/* Settings Content — Aligned with Intelligence Suite typography */}
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            <CoverPageHUD />
                        </div>
                        
                        {/* HUD Footer */}
                        <div className="px-4 py-2 border-t border-primary/10 bg-background/40">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-40">
                                <span>Stable Configuration</span>
                                <span>v1.0.4</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
