
'use client';

import { useState, useEffect, useCallback } from 'react';
import { templates as initialTemplates, type Template, type TemplateKey } from '@/lib/docx-styles';

const DOCX_STYLES_KEY = 'arkan-docx-styles';

// Helper to set nested property
function set(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
    if (typeof current !== 'object' || current === null) return; // Path is not valid
  }
  current[keys[keys.length - 1]] = value;
}


export function useDocxStyles() {
  const [templates, setTemplates] = useState<Record<TemplateKey, Template>>({} as Record<TemplateKey, Template>);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedStyles = localStorage.getItem(DOCX_STYLES_KEY);
      if (storedStyles) {
        setTemplates(JSON.parse(storedStyles));
      } else {
        setTemplates(initialTemplates);
      }
    } catch (error) {
      console.error('Failed to load styles from localStorage', error);
      setTemplates(initialTemplates);
    }
    setIsLoaded(true);
  }, []);

  const saveTemplates = (updatedTemplates: Record<TemplateKey, Template>) => {
    setTemplates(updatedTemplates);
    try {
      localStorage.setItem(DOCX_STYLES_KEY, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Failed to save styles to localStorage', error);
    }
  };

  const updateStyle = useCallback((templateKey: TemplateKey, path: string, value: string | number | boolean) => {
    setTemplates(prevTemplates => {
      const newTemplates = JSON.parse(JSON.stringify(prevTemplates));
      const templateToUpdate = newTemplates[templateKey];
      
      // The path to update is within the `styles.default` object.
      set(templateToUpdate.styles.default, path, value);
      
      saveTemplates(newTemplates);
      return newTemplates;
    });
  }, []);

  return { templates, isLoaded, updateStyle };
}
