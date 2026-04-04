'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/**
 * TagManager — A reusable high-fidelity HUD for managing rule/constraint matrices.
 * Features technical typography and standardized "Intelligence Suite" tokens.
 */

interface TagManagerProps {
    label: string;
    description?: string;
    value: readonly string[];
    onChange: (value: string[]) => void;
    placeholder: string;
}

export function TagManager({ label, description, value, onChange, placeholder }: TagManagerProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1 px-1">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{label}</Label>
                {description && (
                    <p className="text-[9px] text-muted-foreground/40 italic font-medium">{description}</p>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex flex-wrap gap-2 rounded-[20px] border border-primary/10 bg-muted/5 p-2.5 min-h-[48px] shadow-inner transition-all focus-within:border-primary/20">
                    {value.map((item, index) => (
                        <Badge 
                            key={index} 
                            variant="secondary" 
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-background/60 border-primary/5 text-muted-foreground hover:text-primary transition-all hover:scale-105"
                        >
                            {item}
                            <button 
                                onClick={() => handleRemove(index)} 
                                className="rounded-full hover:bg-primary/10 p-0.5 transition-colors"
                            >
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </Badge>
                    ))}
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 px-2 h-7 text-[11px] bg-transparent font-medium placeholder:text-muted-foreground/20"
                    />
                </div>
            </div>
        </div>
    );
}
