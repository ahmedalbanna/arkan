/**
 * API Route لإدارة الأقسام - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema للأقسام
const SectionSchema = z.object({
    id: z.string().min(3, 'ID must be at least 3 characters'),
    title: z.string().min(1, 'Title is required'),
    icon: z.string().min(1, 'Icon is required'),
    agentId: z.string().min(1, 'Agent is required'),
    type: z.enum(['report', 'diagram', 'presentation']),
});

export const GET = createApiHandler(async (context) => {
    try {
        const snapshot = await adminDb.collection('sections').orderBy('title').get();
        const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return ApiResponse.success(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return ApiResponse.error('Failed to fetch sections', 500);
    }
}, { requireAuth: false });

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const data = await request.json();
        const { id, ...sectionData } = data;

        const docRef = adminDb.collection('sections').doc(id);
        await docRef.set(sectionData);
        return ApiResponse.created({ id, ...sectionData });
    } catch (error) {
        console.error('Error creating section:', error);
        return ApiResponse.error('Failed to create section', 500);
    }
}, { validateBody: SectionSchema, requireAdmin: true });
