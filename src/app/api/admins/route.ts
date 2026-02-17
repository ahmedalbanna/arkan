import { createApiResponse, handleApiError } from '@/lib/utils/api-utils';
import { prisma } from '@/lib/db/prisma';

// Public endpoint to fetch admins for support chat initiation
export async function GET() {
    try {
        const admins = await prisma.user.findMany({
            where: { 
                role: { in: ['ADMIN', 'SUPER_ADMIN'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });
        
        const formattedAdmins = admins.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            profilePictureUrl: admin.image,
        }));
        
        return createApiResponse(formattedAdmins, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
