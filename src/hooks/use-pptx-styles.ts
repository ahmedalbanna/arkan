
'use client';

import { useState, useEffect, useCallback } from 'react';
import { templates as initialTemplates, type PptxTemplate, type PptxTemplateKey } from '@/lib/pptx-styles';

const PPTX_STYLES_KEY = 'arkan-pptx-styles';

// Helper to set nested property
function set(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] === 'undefined') {
        current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}


export function usePptxStyles() {
  const [templates, setTemplates] = useState<Record<PptxTemplateKey, PptxTemplate>>({} as Record<PptxTemplateKey, PptxTemplate>);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedStyles = localStorage.getItem(PPTX_STYLES_KEY);
      if (storedStyles) {
        setTemplates(JSON.parse(storedStyles));
      } else {
        setTemplates(initialTemplates);
      }
    } catch (error) {
      console.error('Failed to load pptx styles from localStorage', error);
      setTemplates(initialTemplates);
    }
    setIsLoaded(true);
  }, []);

  const saveTemplates = (updatedTemplates: Record<PptxTemplateKey, PptxTemplate>) => {
    setTemplates(updatedTemplates);
    try {
      localStorage.setItem(PPTX_STYLES_KEY, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Failed to save pptx styles to localStorage', error);
    }
  };

  const updateStyle = useCallback((templateKey: PptxTemplateKey, path: string, value: string | number | boolean) => {
    setTemplates(prevTemplates => {
      const newTemplates = JSON.parse(JSON.stringify(prevTemplates));
      const templateToUpdate = newTemplates[templateKey];
      
      set(templateToUpdate.styles, path, value);
      
      saveTemplates(newTemplates);
      return newTemplates;
    });
  }, []);

  return { templates, isLoaded, updateStyle };
}
