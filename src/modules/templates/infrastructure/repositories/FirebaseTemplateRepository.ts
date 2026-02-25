
import "reflect-metadata";
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ITemplateRepository, Template } from "../../domain/repositories/ITemplateRepository";
import { templates as defaultDocxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { templates as defaultPptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';

@injectable()
export class FirebaseTemplateRepository implements ITemplateRepository {
    async getAll(type: 'docx' | 'pptx'): Promise<Template[]> {
        const stylesCollection = adminDb.collection('templates').doc(type).collection('styles');
        let snapshot = await stylesCollection.get();

        if (snapshot.empty) {
            const defaultTemplates = type === 'docx' ? defaultDocxTemplates : defaultPptxTemplates;
            const batch = adminDb.batch();
            Object.keys(defaultTemplates).forEach(key => {
                const template = (defaultTemplates as any)[key];
                const docRef = stylesCollection.doc(key);
                batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
            });
            await batch.commit();
            snapshot = await stylesCollection.get();
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
    }

    async getById(type: 'docx' | 'pptx', id: string): Promise<Template | null> {
        const doc = await adminDb.collection('templates').doc(type).collection('styles').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Template;
    }

    async save(type: 'docx' | 'pptx', data: Template): Promise<Template> {
        const docRef = adminDb.collection('templates').doc(type).collection('styles').doc(data.id);
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

    async delete(type: 'docx' | 'pptx', id: string): Promise<void> {
        await adminDb.collection('templates').doc(type).collection('styles').doc(id).delete();
    }
}
