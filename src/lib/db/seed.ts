import { db } from './index';
import { users, skills, userSkills, projects, media, comments, tags, projectTags, technologies, summaryTechnologies } from './schema';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_COMMENTS } from '../data';

async function seed() {
  console.log('Seeding database...');

  // Use a transaction to ensure all or nothing
  await db.transaction(async (tx) => {
    // Clear existing data in reverse order of dependencies
    await tx.delete(userSkills).execute();
    await tx.delete(projectTags).execute();
    await tx.delete(summaryTechnologies).execute();
    await tx.delete(comments).execute();
    await tx.delete(media).execute();
    await tx.delete(projects).execute();
    await tx.delete(users).execute();
    await tx.delete(skills).execute();
    await tx.delete(tags).execute();
    await tx.delete(technologies).execute();

    // Seed Users and Skills
    const allSkills = new Set<string>();
    MOCK_USERS.forEach(user => user.skills.forEach(skill => allSkills.add(skill)));

    if (allSkills.size > 0) {
      const insertedSkills = await tx.insert(skills).values([...allSkills].map(name => ({ name }))).returning({ id: skills.id, name: skills.name }).execute();
      const skillMap = new Map(insertedSkills.map(s => [s.name, s.id]));

      await tx.insert(users).values(MOCK_USERS.map(({ id, name, avatarUrl, bio }) => ({ id, name, avatarUrl, bio }))).execute();

      const userSkillRelations = MOCK_USERS.flatMap(user =>
        user.skills.map(skillName => {
          const skillId = skillMap.get(skillName);
          if (!skillId) throw new Error(`Skill not found: ${skillName}`);
          return {
            userId: user.id,
            skillId: skillId
          }
        })
      );
      if (userSkillRelations.length > 0) {
        await tx.insert(userSkills).values(userSkillRelations).execute();
      }
    }

    // Seed Projects, Tags, Media, Comments, and Technologies
    const allTags = new Set<string>();
    const allTechs = new Set<string>();
    MOCK_PROJECTS.forEach(project => {
      project.tags.forEach(tag => allTags.add(tag));
      project.summary?.technologies.forEach(tech => allTechs.add(tech));
    });

    const tagMap = new Map<string, number>();
    if (allTags.size > 0) {
      const insertedTags = await tx.insert(tags).values([...allTags].map(name => ({ name }))).returning({ id: tags.id, name: tags.name }).execute();
      insertedTags.forEach(t => tagMap.set(t.name, t.id));
    }

    const techMap = new Map<string, number>();
    if (allTechs.size > 0) {
      const insertedTechs = await tx.insert(technologies).values([...allTechs].map(name => ({ name }))).returning({ id: technologies.id, name: technologies.name }).execute();
      insertedTechs.forEach(t => techMap.set(t.name, t.id));
    }

    await tx.insert(projects).values(MOCK_PROJECTS.map(p => ({
      id: p.id,
      userId: p.userId,
      title: p.title,
      description: p.description,
      category: p.category,
      liveLink: p.liveLink,
      summaryShort: p.summary?.short,
      createdAt: p.createdAt,
    }))).execute();

    const projectTagRelations = MOCK_PROJECTS.flatMap(p =>
      p.tags.map(tagName => {
        const tagId = tagMap.get(tagName);
        if (!tagId) throw new Error(`Tag not found: ${tagName}`);
        return {
          projectId: p.id,
          tagId: tagId
        }
      })
    );
    if (projectTagRelations.length > 0) {
      await tx.insert(projectTags).values(projectTagRelations).execute();
    }

    const summaryTechRelations = MOCK_PROJECTS.flatMap(p =>
      p.summary?.technologies.map(techName => {
        const techId = techMap.get(techName);
        if (!techId) throw new Error(`Technology not found: ${techName}`);
        return {
          projectId: p.id,
          technologyId: techId
        }
      }) || []
    );
    if (summaryTechRelations.length > 0) {
      await tx.insert(summaryTechnologies).values(summaryTechRelations).execute();
    }

    const allMedia = MOCK_PROJECTS.flatMap(p =>
      p.media.map(m => ({ ...m, projectId: p.id }))
    );
    if (allMedia.length > 0) {
      await tx.insert(media).values(allMedia).execute();
    }

    if (MOCK_COMMENTS.length > 0) {
      await tx.insert(comments).values(MOCK_COMMENTS).execute();
    }
  });


  console.log('Database seeded successfully!');
}

seed().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
