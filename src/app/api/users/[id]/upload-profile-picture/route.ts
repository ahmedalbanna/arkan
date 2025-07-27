
import { NextResponse } from 'next/server';
import { getAdminAuth, adminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { getUserProfile } from '@/lib/db/queries';

async function verifyAccess(request: Request, targetUserId: string) {
  const adminAuth = getAdminAuth();
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authorized: false, message: "Unauthorized" };
  }
  const token = authHeader.substring(7);

  try {
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const requesterId = decodedToken.uid;
    const requesterProfile = await getUserProfile(requesterId);
    
    if (requesterProfile?.role === 'admin' || requesterId === targetUserId) {
        return { authorized: true };
    }
    
    return { authorized: false, message: "Forbidden" };

  } catch (error) {
    return { authorized: false, message: "Unauthorized" };
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id: userId } = params;
    
    const accessCheck = await verifyAccess(request, userId);
    if (!accessCheck.authorized) {
        return NextResponse.json({ message: accessCheck.message }, { status: accessCheck.message === 'Forbidden' ? 403 : 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
        }
        
        const storage = getStorage();
        const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        const fileName = `profile_pictures/${userId}/${Date.now()}-${file.name}`;
        
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const fileUpload = bucket.file(fileName);
        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        await fileUpload.makePublic();

        const publicUrl = fileUpload.publicUrl();

        await adminDb.collection('users').doc(userId).update({
            profilePictureUrl: publicUrl,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ profilePictureUrl: publicUrl }, { status: 200 });

    } catch (error: any) {
        console.error(`Error uploading profile picture for user ${userId}:`, error);
        return NextResponse.json({ message: error.message || 'An error occurred during upload.' }, { status: 500 });
    }
}
