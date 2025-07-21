
// src/app/api/sync/firestore-to-sqlite/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import type { Agent, AgentPrompt } from '@/lib/agents';

// Helper to verify the request comes from a trusted source
function verifyRequest(request: Request) {
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!process.env.SYNC_SECRET) {
        console.error("SYNC_SECRET is not set in environment variables.");
        return { authorized: false, message: "Sync endpoint not configured." };
    }
    if (secret !== process.env.SYNC_SECRET) {
        return { authorized: false, message: "Unauthorized." };
    }
    return { authorized: true };
}

export async function POST(request: Request) {
    const authCheck = verifyRequest(request);
    if (!authCheck.authorized) {
        return NextResponse.json({ message: authCheck.message }, { status: 401 });
    }

    console.log("Starting Firestore to SQLite synchronization...");

    try {
        // --- Users ---
        const usersSnapshot = await adminDb.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (users.length > 0) {
            await db.insert(schema.users).values(users as any).onConflictDoUpdate({
                target: schema.users.id,
                set: { 
                    name: sql`excluded.name`,
                    email: sql`excluded.email`,
                    credits: sql`excluded.credits`,
                    role: sql`excluded.role`,
                    updatedAt: sql`excluded.updated_at`,
                    bio: sql`excluded.bio`,
                    profilePictureUrl: sql`excluded.profile_picture_url`,
                    hasCompletedOnboarding: sql`excluded.has_completed_onboarding`,
                 }
            });
            console.log(`Synced ${users.length} users.`);
        }

        // --- Agents ---
        const agentsSnapshot = await adminDb.collection('agents').get();
        const agents = agentsSnapshot.docs.map(doc => {
            const data = doc.data() as Agent;
            return { ...data, id: doc.id, prompt: JSON.stringify(data.prompt) }; // SQLite expects prompt as string
        });
        if (agents.length > 0) {
            await db.insert(schema.agents).values(agents).onConflictDoUpdate({
                target: schema.agents.id,
                set: {
                    name: sql`excluded.name`,
                    description: sql`excluded.description`,
                    category: sql`excluded.category`,
                    pageUrl: sql`excluded.page_url`,
                    isEnabled: sql`excluded.is_enabled`,
                    prompt: sql`excluded.prompt`,
                }
            });
            console.log(`Synced ${agents.length} agents.`);
        }

        // --- Features ---
        const featuresSnapshot = await adminDb.collection('features').get();
        const features = featuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (features.length > 0) {
            await db.insert(schema.features).values(features as any).onConflictDoUpdate({
                target: schema.features.id,
                set: {
                    name: sql`excluded.name`,
                    description: sql`excluded.description`,
                    isEnabled: sql`excluded.is_enabled`,
                }
            });
            console.log(`Synced ${features.length} features.`);
        }
        
        // --- DOCX Templates ---
        const docxSnapshot = await adminDb.collection('templates').doc('docx').collection('styles').get();
        const docxTemplates = docxSnapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id, styles: JSON.stringify(data.styles) };
        });
        if (docxTemplates.length > 0) {
            await db.insert(schema.docxTemplates).values(docxTemplates as any).onConflictDoUpdate({
                target: schema.docxTemplates.id,
                 set: {
                    name: sql`excluded.name`,
                    description: sql`excluded.description`,
                    styles: sql`excluded.styles`,
                    imageUrl: sql`excluded.image_url`,
                    dataAiHint: sql`excluded.data_ai_hint`,
                }
            });
            console.log(`Synced ${docxTemplates.length} DOCX templates.`);
        }
        
        // --- PPTX Templates ---
        const pptxSnapshot = await adminDb.collection('templates').doc('pptx').collection('styles').get();
        const pptxTemplates = pptxSnapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id, styles: JSON.stringify(data.styles) };
        });
        if (pptxTemplates.length > 0) {
            await db.insert(schema.pptxTemplates).values(pptxTemplates as any).onConflictDoUpdate({
                target: schema.pptxTemplates.id,
                 set: {
                    name: sql`excluded.name`,
                    description: sql`excluded.description`,
                    styles: sql`excluded.styles`,
                    imageUrl: sql`excluded.image_url`,
                    dataAiHint: sql`excluded.data_ai_hint`,
                }
            });
            console.log(`Synced ${pptxTemplates.length} PPTX templates.`);
        }


        console.log("Synchronization complete.");
        return NextResponse.json({ message: "Synchronization successful." }, { status: 200 });
    } catch (error) {
        console.error("Synchronization failed:", error);
        return NextResponse.json({ message: "An unexpected error occurred during synchronization." }, { status: 500 });
    }
}
