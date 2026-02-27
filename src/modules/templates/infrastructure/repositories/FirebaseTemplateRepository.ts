
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { templates as defaultDocxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { templates as defaultPptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';

@injectable()
export class FirebaseTemplateRepository implements ITemplateRepository {
    private getCollection(type: TemplateType) {
        return adminDb.collection('templates').doc(type).collection('items');
    }

    async getAll(type: TemplateType): Promise<Template[]> {
        const collection = this.getCollection(type);
        let snapshot = await collection.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            if (type === 'report') {
                defaultReportTemplates.forEach(template => {
                    const docRef = collection.doc(template.id);
                    batch.set(docRef, template);
                });
            } else if (type === 'presentation') {
                // Presentation templates don't have hardcoded defaults yet, but we could add them
            } else {
                const defaultTemplates = type === 'docx' ? defaultDocxTemplates : defaultPptxTemplates;
                Object.keys(defaultTemplates).forEach(key => {
                    const template = (defaultTemplates as any)[key];
                    const docRef = collection.doc(key);
                    batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
                });
            }
            if (!snapshot.empty || type === 'report' || type === 'docx' || type === 'pptx') {
                await batch.commit();
                snapshot = await collection.get();
            }
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
    }

    async getById(type: TemplateType, id: string): Promise<Template | null> {
        const doc = await this.getCollection(type).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Template;
    }

    async save(type: TemplateType, data: Template): Promise<Template> {
        const docRef = this.getCollection(type).doc(data.id);
        const dataToSave = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        
        const doc = await docRef.get();
        if (!doc.exists) {
            dataToSave.createdAt = new Date().toISOString();
        }
        
        await docRef.set(dataToSave, { merge: true });
        return { ...dataToSave, id: data.id } as Template;
    }

    async delete(type: TemplateType, id: string): Promise<void> {
        await this.getCollection(type).doc(id).delete();
    }
}
