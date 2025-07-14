import { db } from './index';
import { users } from './schema';

const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'علياء سالم',
    email: "alyaa.salem@example.com",
    avatarUrl: 'https://placehold.co/100x100.png',
    bio: 'مطور تطبيقات متخصص في بناء تطبيقات تفاعلية وعالية الأداء. شغوف بتحويل الأفكار إلى واقع ملموس.',
    credits: 25,
    createdAt: '2023-01-15T09:00:00Z',
  },
  {
    id: 'user-2',
    name: 'خالد الغامدي',
    email: 'khaled.alghamdi@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    bio: 'مصمم واجهات مستخدم ومطور ويب بخبرة تزيد عن 5 سنوات. أركز على إنشاء تجارب مستخدم جذابة وسهلة الاستخدام.',
    credits: 200,
    createdAt: '2023-02-20T11:00:00Z',
  },
];

async function seed() {
  console.log('Seeding database...');

  db.transaction((tx) => {
    tx.delete(users).execute();
    tx.insert(users).values(MOCK_USERS.map(({ id, name, email, avatarUrl, bio, credits, createdAt }) => ({ id, name, email, avatarUrl, bio, credits, createdAt }))).execute();
  });

  console.log('Database seeded successfully!');
}

seed().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
