import { integer, text, sqliteTable, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  credits: integer('credits').notNull().default(10),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  comments: many(comments),
  userSkills: many(userSkills),
}));

// Projects Table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  liveLink: text('live_link'),
  summaryShort: text('summary_short'),
  createdAt: text('created_at').notNull(),
  proposalData: text('proposal_data'),
  reportSections: text('report_sections'),
  reportDiagrams: text('report_diagrams'),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  media: many(media),
  comments: many(comments),
  projectTags: many(projectTags),
  summaryTechnologies: many(summaryTechnologies),
}));

// Media Table
export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['image', 'video'] }).notNull(),
  url: text('url').notNull(),
  alt: text('alt').notNull(),
  aiHint: text('ai_hint'),
});

export const mediaRelations = relations(media, ({ one }) => ({
  project: one(projects, {
    fields: [media.projectId],
    references: [projects.id],
  }),
}));

// Comments Table
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Skills Table
export const skills = sqliteTable('skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

// UserSkills (Junction Table)
export const userSkills = sqliteTable('user_skills', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.skillId] }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));


// Tags Table
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  projectTags: many(projectTags),
}));

// ProjectTags (Junction Table)
export const projectTags = sqliteTable('project_tags', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.projectId, t.tagId] }),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, { fields: [projectTags.projectId], references: [projects.id] }),
  tag: one(tags, { fields: [projectTags.tagId], references: [tags.id] }),
}));

// Technologies Table
export const technologies = sqliteTable('technologies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const technologiesRelations = relations(technologies, ({ many }) => ({
  summaryTechnologies: many(summaryTechnologies),
}));

// SummaryTechnologies (Junction Table)
export const summaryTechnologies = sqliteTable('summary_technologies', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  technologyId: integer('technology_id').notNull().references(() => technologies.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.projectId, t.technologyId] }),
}));

export const summaryTechnologiesRelations = relations(summaryTechnologies, ({ one }) => ({
  project: one(projects, { fields: [summaryTechnologies.projectId], references: [projects.id] }),
  technology: one(technologies, { fields: [summaryTechnologies.technologyId], references: [technologies.id] }),
}));
