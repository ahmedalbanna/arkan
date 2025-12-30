
'use server';

import { adminDb } from '@/lib/firebase/server-init';
import { Project, ReportTemplateProperties, Section, SectionProperties, Chapter } from '@/lib/models';

export async function constructProjectFromTemplate(template: ReportTemplateProperties): Promise<Project> {
    const sectionIds = template.sectionIds || [];
    if (sectionIds.length === 0) return new Project({});
    
    // Fetch all default sections from Firestore in one go
    const sectionsSnapshot = await adminDb.collection('sections').get();
    const allSections = new Map<string, SectionProperties>();
    sectionsSnapshot.forEach(doc => {
        allSections.set(doc.id, { id: doc.id, ...doc.data() } as SectionProperties);
    });
    
    const newContent = sectionIds
        .map(id => allSections.get(id))
        .filter((sectionData): sectionData is SectionProperties => !!sectionData)
        .map(sectionData => new Section(sectionData));

    // Create a single chapter to hold all sections from the template
    const chapter = new Chapter({ title: 'Generated Content', sections: newContent });

    return new Project({ content: [chapter] });
}
