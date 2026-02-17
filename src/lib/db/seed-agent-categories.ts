import prisma from '@/lib/db/prisma';
import { defaultAgentCategories } from './seed-data/agents';

async function seed() {
    console.log("Starting Agent Category seeding process...");

    try {
        console.log("Preparing to seed Agent Categories...");
        for (const category of defaultAgentCategories) {
            await prisma.agentCategory.upsert({
                where: { id: category.id },
                update: {
                    ...category,
                },
                create: {
                    ...category,
                },
            });
        }
        console.log(`${defaultAgentCategories.length} Agent Categories seeded successfully.`);
        console.log("All agent categories have been successfully seeded to PostgreSQL!");

    } catch (error) {
        console.error("Error during agent category seeding:", error);
        process.exit(1);
    }
}

seed().then(() => {
    console.log("Agent category seeding finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Agent category seeding error:", error);
    process.exit(1);
});
