import { db } from './index';
import { users, skills, userSkills, projects, media, comments, tags, projectTags, technologies, summaryTechnologies } from './schema';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_COMMENTS } from '../data';

async function seed() {
  console.log('Seeding database...');
  
  // Use a transaction to ensure all or nothing
  await db.transaction(async (tx) => {
    // Clear existing data in reverse order of dependencies
    await tx.delete(userSkills);
    await tx.delete(projectTags);
    await tx.delete(summaryTechnologies);
    await tx.delete(comments);
    await tx.delete(media);
    await tx.delete(projects);
    await tx.delete(users);
    await tx.delete(skills);
    await tx.delete(tags);
    await tx.delete(technologies);

    // Seed Users and Skills
    const allSkills = new Set<string>();
    MOCK_USERS.forEach(user => user.skills.forEach(skill => allSkills.add(skill)));
    
    if (allSkills.size > 0) {
      const insertedSkills = await tx.insert(skills).values([...allSkills].map(name => ({ name }))).returning({ id: skills.id, name: skills.name });
      const skillMap = new Map(insertedSkills.map(s => [s.name, s.id]));
      
      await tx.insert(users).values(MOCK_USERS.map(({ id, name, avatarUrl, bio }) => ({ id, name, avatarUrl, bio })));
      
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
        await tx.insert(userSkills).values(userSkillRelations);
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
        const insertedTags = await tx.insert(tags).values([...allTags].map(name => ({ name }))).returning({ id: tags.id, name: tags.name });
        insertedTags.forEach(t => tagMap.set(t.name, t.id));
    }
    
    const techMap = new Map<string, number>();
    if (allTechs.size > 0) {
        const insertedTechs = await tx.insert(technologies).values([...allTechs].map(name => ({ name }))).returning({ id: technologies.id, name: technologies.name });
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
    })));

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
      await tx.insert(projectTags).values(projectTagRelations);
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
      await tx.insert(summaryTechnologies).values(summaryTechRelations);
    }

    const allMedia = MOCK_PROJECTS.flatMap(p => 
      p.media.map(m => ({ ...m, projectId: p.id }))
    );
    if (allMedia.length > 0) {
      await tx.insert(media).values(allMedia);
    }

    if (MOCK_COMMENTS.length > 0) {
      await tx.insert(comments).values(MOCK_COMMENTS);
    }
  });


  console.log('Database seeded successfully!');
}

seed().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
