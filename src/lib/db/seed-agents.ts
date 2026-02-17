import prisma from '@/lib/db/prisma';
import { defaultAgents } from './seed-data/agents';

async function seed() {
    console.log("Starting Agent seeding process...");

    try {
        console.log("Preparing to seed Agents...");
        for (const agent of defaultAgents) {
            await prisma.agent.upsert({
                where: { id: agent.id },
                update: {
                    ...agent,
                },
                create: {
                    ...agent,
                },
            });
        }
        console.log(`${defaultAgents.length} Agents seeded successfully.`);
        console.log("All agents have been successfully seeded to PostgreSQL!");

    } catch (error) {
        console.error("Error during agent seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Agent seeding finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Agent seeding error:", error);
    process.exit(1);
});
