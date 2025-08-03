
'use client';

import { create } from 'zustand';
import { IStylesOptions } from 'docx';
import type { TemplateKey } from '@/lib/docx-styles';

interface DesignState {
    activeTemplateKey: TemplateKey;
    localChanges: Partial<Record<TemplateKey, IStylesOptions>>;
    setActiveTemplateKey: (key: TemplateKey) => void;
    updateStyle: (templateKey: TemplateKey, path: string, value: any) => void;
    setLocalChanges: (changes: Partial<Record<TemplateKey, IStylesOptions>>) => void;
    resetLocalChanges: (templateKey: TemplateKey) => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
    activeTemplateKey: 'modern',
    localChanges: {},
    setActiveTemplateKey: (key) => set({ activeTemplateKey: key, localChanges: {} }), // Reset changes on template switch
    setLocalChanges: (changes) => set({ localChanges: changes }),
    updateStyle: (templateKey, path, value) => {
        set(state => {
            const currentChanges = state.localChanges[templateKey] || {};
            const newStyles = JSON.parse(JSON.stringify(currentChanges));
            
            let current = newStyles;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            return {
                localChanges: {
                    ...state.localChanges,
                    [templateKey]: newStyles
                }
            };
        });
    },
    resetLocalChanges: (templateKey) => {
        set(state => {
            const newLocalChanges = { ...state.localChanges };
            delete newLocalChanges[templateKey];
            return { localChanges: newLocalChanges };
        });
    }
}));
