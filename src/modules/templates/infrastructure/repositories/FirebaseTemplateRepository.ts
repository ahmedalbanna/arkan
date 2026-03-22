
import { injectable } from "tsyringe";
import { adminDb } from "@/infrastructure/firebase/server-init";
import { ITemplateRepository, Template, TemplateType } from "../../domain/repositories/ITemplateRepository";
import { templates as defaultDocxTemplates } from '@/modules/ai-content/infrastructure/exporters/DocxStyles';
import { templates as defaultPptxTemplates } from '@/modules/templates/infrastructure/PptxStyles';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';
import { Result } from "@/lib/utils/result";
import { TemplateError } from "../../domain/errors/TemplateErrors";

@injectable()
export class FirebaseTemplateRepository implements ITemplateRepository {
    private getCollection(type: TemplateType) {
        return adminDb.collection('templates').doc(type).collection('items');
    }

    async getAll(type: TemplateType): Promise<Result<Template[], TemplateError>> {
        try {
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
                    // Presentation templates don't have hardcoded defaults yet
                } else {
                    const defaultTemplates = type === 'docx' ? defaultDocxTemplates : defaultPptxTemplates;
                    Object.keys(defaultTemplates).forEach(key => {
                        const template = (defaultTemplates as any)[key];
                        const docRef = collection.doc(key);
                        batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
                    });
                }
                if (type === 'report' || type === 'docx' || type === 'pptx') {
                    await batch.commit();
                    snapshot = await collection.get();
                }
            }

            const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
            return Result.ok(templates);
        } catch (error: any) {
            return Result.fail(TemplateError.internal(error.message));
        }
    }

    async getById(type: TemplateType, id: string): Promise<Result<Template, TemplateError>> {
        try {
            const doc = await this.getCollection(type).doc(id).get();
            if (!doc.exists) {
                return Result.fail(TemplateError.notFound(`Template ${id} not found in ${type}`));
            }
            return Result.ok({ id: doc.id, ...doc.data() } as Template);
        } catch (error: any) {
            return Result.fail(TemplateError.internal(error.message));
        }
    }

    async save(type: TemplateType, data: Template): Promise<Result<Template, TemplateError>> {
        try {
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
            return Result.ok({ ...dataToSave, id: data.id } as Template);
        } catch (error: any) {
            return Result.fail(TemplateError.saveError(error.message));
        }
    }

    async delete(type: TemplateType, id: string): Promise<Result<void, TemplateError>> {
        try {
            await this.getCollection(type).doc(id).delete();
            return Result.ok();
        } catch (error: any) {
            return Result.fail(TemplateError.deleteError(error.message));
        }
    }
}
