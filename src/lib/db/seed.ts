import { db } from './index';
import { users, agents, features, docxTemplates, pptxTemplates } from './schema';
import { AGENTS as defaultAgents } from '@/lib/agents';
import { templates as defaultDocxTemplates, type TemplateKey as DocxTemplateKey } from '@/lib/docx-styles';
import { templates as defaultPptxTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'علياء سالم',
    email: "alyaa.salem@example.com",
    bio: 'مطور تطبيقات متخصص في بناء تطبيقات تفاعلية وعالية الأداء. شغوف بتحويل الأفكار إلى واقع ملموس.',
    credits: 25,
    role: 'user' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'خالد الغامدي',
    email: 'khaled.alghamdi@example.com',
    bio: 'مصمم واجهات مستخدم ومطور ويب بخبرة تزيد عن 5 سنوات. أركز على إنشاء تجارب مستخدم جذابة وسهلة الاستخدام.',
    credits: 200,
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultFeatures = [
    { id: 'proposal', name: 'Proposal Mode', description: 'Allows users to generate full project proposals.', isEnabled: true },
    { id: 'report', name: 'Report Generator', description: 'Allows users to generate report sections.', isEnabled: true },
    { id: 'diagram', name: 'Diagram Generator', description: 'Allows users to generate various UML diagrams.', isEnabled: true },
    { id: 'code', name: 'Code Generator', description: 'Allows users to generate HTML/CSS/JS components.', isEnabled: true },
    { id: 'presentation', name: 'Presentation Generator', description: 'Allows users to generate PPTX presentations.', isEnabled: true },
];


async function seed() {
  console.log('Seeding SQLite database...');

  try {
    db.transaction((tx) => {
        // Clear existing data
        console.log("Clearing existing data...");
        tx.delete(users).run();
        tx.delete(agents).run();
        tx.delete(features).run();
        tx.delete(docxTemplates).run();
        tx.delete(pptxTemplates).run();

        // Seed users
        console.log("Seeding users...");
        tx.insert(users).values(MOCK_USERS).run();
        
        // Seed agents
        console.log("Seeding agents...");
        const agentValues = defaultAgents.map(agent => {
            const { icon, ...rest } = agent;
            return { ...rest, prompt: JSON.stringify(rest.prompt) };
        });
        tx.insert(agents).values(agentValues).run();

        // Seed features
        console.log("Seeding features...");
        tx.insert(features).values(defaultFeatures).run();

        // Seed docx templates
        console.log("Seeding DOCX templates...");
        const docxValues = (Object.keys(defaultDocxTemplates) as DocxTemplateKey[]).map(key => {
            const template = defaultDocxTemplates[key];
            return { id: key, ...template, styles: JSON.stringify(template.styles) };
        });
        tx.insert(docxTemplates).values(docxValues).run();

        // Seed pptx templates
        console.log("Seeding PPTX templates...");
        const pptxValues = (Object.keys(defaultPptxTemplates) as PptxTemplateKey[]).map(key => {
            const template = defaultPptxTemplates[key];
            return { id: key, ...template, styles: JSON.stringify(template.styles) };
        });
        tx.insert(pptxTemplates).values(pptxValues).run();
    });

    console.log('Database seeded successfully!');
  } catch (error) {
     console.error('Failed to seed database:', error);
     process.exit(1);
  }
}

seed();
