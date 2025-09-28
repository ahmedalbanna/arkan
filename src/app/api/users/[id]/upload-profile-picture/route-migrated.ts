/**
 * User Upload Profile Picture Route - Migrated to New System
 *
 * هذا الملف يحتوي على route رفع صورة الملف الشخصي المهاجر
 * مع استخدام النظام الجديد المحسن
 */

import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { Analytics, PerformanceMonitor } from '@/lib/core/performance';
import { adminDb } from '@/lib/firebase/server-init';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';

// Enhanced validation schema
const uploadSchema = z.object({
    file: z.any(), // File object from FormData
    cropData: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
    }).optional(),
    quality: z.number().min(0.1).max(1).optional().default(0.8),
});

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
    'image/jpeg': { extension: 'jpg', maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/png': { extension: 'png', maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/webp': { extension: 'webp', maxSize: 5 * 1024 * 1024 }, // 5MB
    'image/gif': { extension: 'gif', maxSize: 10 * 1024 * 1024 }, // 10MB
} as const;

/**
 * Upload and process profile picture with enhanced validation and optimization
 */
export const POST = withEnhancedAuth(async ({ request, params, user: requester, startTime }) => {
    try {
        const { id: targetUserId } = await params;

        // Enhanced authorization check
        if (requester.role !== 'admin' && requester.id !== targetUserId) {
            return handleApiErrorEnhanced(
                new Error('Forbidden: You can only upload your own profile picture'),
                'profile_picture_upload_denied',
                {
                    requesterId: requester.id,
                    targetUserId,
                    requesterRole: requester.role
                }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const cropDataStr = formData.get('cropData') as string | null;
        const qualityStr = formData.get('quality') as string | null;

        if (!file) {
            return handleApiErrorEnhanced(
                new Error('No file uploaded'),
                'profile_picture_no_file',
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
            const allowedTypes = Object.keys(ALLOWED_FILE_TYPES).join(', ');
            return handleApiErrorEnhanced(
                new Error(`Invalid file type. Allowed types: ${allowedTypes}`),
                'profile_picture_invalid_type',
                {
                    fileType: file.type,
                    allowedTypes: Object.keys(ALLOWED_FILE_TYPES)
                }
            );
        }

        // Validate file size
        const fileTypeConfig = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
        if (file.size > fileTypeConfig.maxSize) {
            return handleApiErrorEnhanced(
                new Error(`File too large. Maximum size: ${fileTypeConfig.maxSize / (1024 * 1024)}MB`),
                'profile_picture_file_too_large',
                {
                    fileSize: file.size,
                    maxSize: fileTypeConfig.maxSize
                }
            );
        }

        // Parse optional parameters
        let cropData = null;
        let quality = 0.8;

        if (cropDataStr) {
            try {
                cropData = JSON.parse(cropDataStr);
            } catch (error) {
                console.warn('Invalid crop data provided:', error);
            }
        }

        if (qualityStr) {
            const parsedQuality = parseFloat(qualityStr);
            if (!isNaN(parsedQuality) && parsedQuality >= 0.1 && parsedQuality <= 1) {
                quality = parsedQuality;
            }
        }

        // Get Firebase Storage
        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            return handleApiErrorEnhanced(
                new Error('Firebase Storage bucket name not configured'),
                'profile_picture_storage_config_error',
                { status: 500 }
            );
        }

        const bucket = storage.bucket(bucketName);

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = fileTypeConfig.extension;
        const fileName = `profile_pictures/${targetUserId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // Convert file to buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // TODO: In a real implementation, you would:
        // 1. Process the image (resize, crop, optimize)
        // 2. Generate multiple sizes (thumbnail, medium, large)
        // 3. Apply image compression
        // 4. Store metadata about the image

        // Upload file to Firebase Storage
        const fileUpload = bucket.file(fileName);
        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.type,
                customMetadata: {
                    userId: targetUserId,
                    originalName: file.name,
                    uploadedAt: new Date().toISOString(),
                    quality: quality.toString(),
                    hasCropData: (!!cropData).toString(),
                }
            },
        });

        // Make file public
        await fileUpload.makePublic();
        const publicUrl = fileUpload.publicUrl();

        // Update user profile in database
        await adminDb.collection('users').doc(targetUserId).update({
            profilePictureUrl: publicUrl,
            updatedAt: new Date().toISOString(),
        });

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'profile_picture_uploaded',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'users/[id]/upload-profile-picture',
                targetUserId,
                requesterId: requester.id,
                fileSize: file.size,
                fileType: file.type,
                fileName,
                success: true
            }
        });

        // Track analytics
        Analytics.trackApiCall(
            `/api/users/${targetUserId}/upload-profile-picture`,
            'POST',
            performance.now() - startTime,
            true,
            200
        );

        return createApiResponseEnhanced(
            {
                profilePictureUrl: publicUrl,
                fileName,
                fileSize: file.size,
                fileType: file.type,
                uploadedAt: new Date().toISOString(),
                metadata: {
                    hasCropData: !!cropData,
                    quality,
                    originalName: file.name
                }
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]/upload-profile-picture',
                targetUserId,
                requesterId: requester.id,
                fileSize: file.size,
                fileType: file.type
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'profile_picture_upload');
    }
}, {
    performanceTracking: true,
    analytics: true,
    rateLimit: {
        maxRequests: 10, // Limit upload attempts
        windowMs: 300000 // 5 minutes
    }
});

/**
 * Delete profile picture (admin only)
 */
export const DELETE = withEnhancedAuth(async ({ params, user: requester, startTime }) => {
    try {
        const { id: targetUserId } = await params;

        // Get user profile to check current picture
        const user = await adminDb.collection('users').doc(targetUserId).get();
        if (!user.exists) {
            return handleApiErrorEnhanced(
                new Error('User not found'),
                'profile_picture_delete_user_not_found',
                { targetUserId },
                { status: 404 }
            );
        }

        const userData = user.data();
        const currentPictureUrl = userData?.profilePictureUrl;

        if (!currentPictureUrl) {
            return createApiResponseEnhanced(
                { message: 'No profile picture to delete' },
                200,
                {
                    processingTime: performance.now() - startTime,
                    endpoint: 'users/[id]/upload-profile-picture',
                    targetUserId
                }
            );
        }

        // Extract file path from URL
        const urlParts = currentPictureUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const fullPath = `profile_pictures/${targetUserId}/${fileName}`;

        // Delete from Firebase Storage
        const storage = getStorage();
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (bucketName) {
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(fullPath);

            try {
                await file.delete();
            } catch (error) {
                console.warn('Failed to delete file from storage:', error);
            }
        }

        // Update user profile
        await adminDb.collection('users').doc(targetUserId).update({
            profilePictureUrl: '',
            updatedAt: new Date().toISOString(),
        });

        // Track performance
        PerformanceMonitor.recordEvent({
            type: 'api_call',
            name: 'profile_picture_deleted',
            value: performance.now() - startTime,
            unit: 'ms',
            metadata: {
                endpoint: 'users/[id]/upload-profile-picture',
                targetUserId,
                requesterId: requester.id,
                deletedFileName: fullPath,
                success: true
            }
        });

        return createApiResponseEnhanced(
            {
                message: 'Profile picture deleted successfully',
                deletedFileName: fullPath,
                timestamp: new Date().toISOString()
            },
            200,
            {
                processingTime: performance.now() - startTime,
                endpoint: 'users/[id]/upload-profile-picture',
                targetUserId,
                requesterId: requester.id
            }
        );

    } catch (error: any) {
        return handleApiErrorEnhanced(error, 'profile_picture_deletion');
    }
}, {
    requireAdmin: true,
    performanceTracking: true,
    analytics: true
});
