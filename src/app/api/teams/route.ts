/**
 * API Route للفرق - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { TeamSchemas } from '@/core/validation/api-validators';
import { adminDb } from '@/lib/firebase/server-init';
import type { TeamProperties, TeamWithMembers } from '@/lib/models/team';

export const GET = createApiHandler(async (context) => {
    try {
        const { user } = context;

        if (!user.teams || user.teams.length === 0) {
            return ApiResponse.success([]);
        }

        const teamsQuery = adminDb.collection('teams')
            .where('__name__', 'in', user.teams)
            .get();

        const teamsSnapshot = await teamsQuery;
        const teams: TeamWithMembers[] = [];

        for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();

            // جلب أعضاء الفريق
            const membersQuery = adminDb.collection('users')
                .where('teams', 'array-contains', teamDoc.id)
                .get();

            const membersSnapshot = await membersQuery;
            const members = membersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            teams.push({
                id: teamDoc.id,
                ...teamData,
                members,
            });
        }

        return ApiResponse.success(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return ApiResponse.error('Failed to fetch teams', 500);
    }
}, { requireAuth: true });

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

        const teamData = {
            ...data,
            ownerId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            memberCount: 1,
        };

        const docRef = await adminDb.collection('teams').add(teamData);

        // إضافة المستخدم كعضو في الفريق
        await adminDb.collection('users').doc(user.id).update({
            teams: adminDb.FieldValue.arrayUnion(docRef.id),
        });

        return ApiResponse.created({
            id: docRef.id,
            ...teamData,
        });
    } catch (error) {
        console.error('Error creating team:', error);
        return ApiResponse.error('Failed to create team', 500);
    }
}, { validateBody: TeamSchemas.createTeam, requireAuth: true });

export const PUT = createApiHandler(async (context) => {
    try {
        const { request, params, user } = context;
        const teamId = params?.id;
        const data = await request.json();

        if (!teamId) {
            return ApiResponse.badRequest('Team ID is required');
        }

        // التحقق من أن المستخدم يملك الفريق
        const teamDoc = await adminDb.collection('teams').doc(teamId).get();

        if (!teamDoc.exists) {
            return ApiResponse.notFound('Team not found');
        }

        const teamData = teamDoc.data();

        if (teamData?.ownerId !== user.id) {
            return ApiResponse.forbidden('Access denied - only team owner can update team');
        }

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('teams').doc(teamId).update(updateData);

        return ApiResponse.success({
            id: teamId,
            ...teamData,
            ...updateData,
        });
    } catch (error) {
        console.error('Error updating team:', error);
        return ApiResponse.error('Failed to update team', 500);
    }
}, { validateBody: TeamSchemas.updateTeam, requireAuth: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params, user } = context;
        const teamId = params?.id;

        if (!teamId) {
            return ApiResponse.badRequest('Team ID is required');
        }

        // التحقق من أن المستخدم يملك الفريق
        const teamDoc = await adminDb.collection('teams').doc(teamId).get();

        if (!teamDoc.exists) {
            return ApiResponse.notFound('Team not found');
        }

        const teamData = teamDoc.data();

        if (teamData?.ownerId !== user.id) {
            return ApiResponse.forbidden('Access denied - only team owner can delete team');
        }

        // حذف الفريق
        await adminDb.collection('teams').doc(teamId).delete();

        // إزالة الفريق من جميع الأعضاء
        const membersQuery = adminDb.collection('users')
            .where('teams', 'array-contains', teamId)
            .get();

        const membersSnapshot = await membersQuery;
        const batch = adminDb.batch();

        membersSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                teams: adminDb.FieldValue.arrayRemove(teamId),
            });
        });

        await batch.commit();

        return ApiResponse.success({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        return ApiResponse.error('Failed to delete team', 500);
    }
}, { requireAuth: true });
