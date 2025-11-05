
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import type { Section } from '@/lib/models';

export function useSectionAccordionItemLogic(section: Section | undefined) {
    const { t } = useLocalization();
    const title = section?.title || 'Unknown Section';

    return { t, title };
}
