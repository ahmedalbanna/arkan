import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import type { ReportTemplateProperties } from '@/modules/templates/domain/entities/ReportTemplate';
import { Section } from '@/modules/ai-content/domain/entities/Section';
import { Chapter } from '@/modules/ai-content/domain/entities/Chapter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Applies a report template to a project, creating the necessary chapters and sections.
 * @param project The project to apply the template to.
 * @param template The report template to apply.
 * @returns A new Project instance with the template applied.
 */
export function applyReportTemplate(project: Project, template: ReportTemplateProperties): Project {
    if (!template.content) {
        return project;
    }
    
    // Create new chapters and sections directly from the template's content definition.
    const newContent = template.content.map(chapterData => {
      const sections = (chapterData.sections || []).map(sectionInfo => {
        // sectionInfo from the template is the source of truth
        return new Section({ id: uuidv4(), ...sectionInfo });
      });
      return new Chapter({ id: uuidv4(), title: chapterData.title, sections: sections });
    });

    // Apply project configuration from template if provided
    const projectUpdates: Partial<ProjectProperties> = {
      content: newContent,
    };

    if (template.projectType) projectUpdates.projectType = template.projectType;
    if (template.specialization) projectUpdates.specialization = template.specialization;
    if (template.university) projectUpdates.university = template.university;
    if (template.course) projectUpdates.course = template.course;
    if (template.educationalLevel) projectUpdates.educationalLevel = template.educationalLevel;

    return project.with(projectUpdates);
}
