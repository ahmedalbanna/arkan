import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getUserProfile,
  updateUser,
  updateUserByAdmin,
} from "@/lib/db/queries";
import { getAdminAuth, adminDb } from "@/lib/firebase/admin";
import type { UserRole } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

// Helper to verify if the requester is an admin OR the user themselves
async function verifyAccess(request: Request, targetUserId: string) {
  const adminAuth = getAdminAuth();
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      authorized: false,
      message: "Unauthorized",
      isSelf: false,
      isAdmin: false,
    };
  }
  const token = authHeader.substring(7);

  try {
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const requesterId = decodedToken.uid;

    const requesterProfile = await getUserProfile(requesterId);
    const isAdmin = requesterProfile?.role === "admin";
    const isSelf = requesterId === targetUserId;

    if (isAdmin || isSelf) {
      return { authorized: true, userId: requesterId, isSelf, isAdmin };
    }

    // If neither, forbid access
    return {
      authorized: false,
      message: "Forbidden",
      isSelf: false,
      isAdmin: false,
    };
  } catch (error) {
    return {
      authorized: false,
      message: "Unauthorized",
      isSelf: false,
      isAdmin: false,
    };
  }
}

// GET /api/users/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }

    const accessCheck = await verifyAccess(request, userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { message: accessCheck.message },
        { status: accessCheck.message === 'Forbidden' ? 403 : 401 }
      );
    }

    const user = await getUserProfile(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  role: z.enum(['user', 'admin']).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
});

// PUT (update) a user profile
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const accessCheck = await verifyAccess(request, userId);
        if (!accessCheck.authorized) {
            return NextResponse.json({ message: accessCheck.message }, { status: accessCheck.message === 'Forbidden' ? 403 : 401 });
        }

        const body = await request.json();
        const validation = updateUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const updateData = {
            ...validation.data,
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection("users").doc(userId).update(updateData);

        // Revalidate paths to update cached data
        revalidatePath(`/profile/${userId}`);
        if(accessCheck.isAdmin) {
             revalidatePath('/admin/manage-users');
        }

        const updatedUser = await getUserProfile(userId);

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error(`Error updating user ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const adminAuth = getAdminAuth();
  try {
    const {id:targetUserId} = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const requesterId = decodedToken.uid;

    const requesterProfile = await getUserProfile(requesterId);
    if (requesterProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminAuth.deleteUser(targetUserId);
    await adminDb.collection("users").doc(targetUserId).delete();

    revalidatePath("/admin/manage-users");

    return NextResponse.json({
      message: `User ${targetUserId} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}