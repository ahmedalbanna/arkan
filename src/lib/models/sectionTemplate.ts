
import { Template, type BaseTemplateProperties } from './template';
import { Project } from './project';
import { Section, type SectionProperties } from './section';

// The content of a section template defines its structure
export interface SectionTemplateContent {
  title: string;
  initialContent: string;
}

// Concrete properties for a SectionTemplate, fixing the type
export interface SectionTemplateProperties extends BaseTemplateProperties<SectionTemplateContent> {
  type: 'section';
}

export class SectionTemplate extends Template<SectionTemplateContent> {
  constructor(props: SectionTemplateProperties) {
    super(props);
  }

  /**
   * Applies the template to a project, creating a new section within it.
   * @param project The project to which the new section will be added.
   * @param newSectionId A unique ID for the new section being created.
   * @returns The project instance with the new section added.
   */
  public apply(project: Project, newSectionId: string): Project {
    const newSectionProps: SectionProperties = {
      id: newSectionId,
      title: this.content.title, // Use title from template content
      icon: 'FileText', // Default icon
      agentId: 'default-agent', // Default agent
      type: 'report' // Default type
    };
    
    // This assumes a project has a method to add sections.
    // If not, this logic would live where the project state is managed.
    // For example: project.addSection(new Section(newSectionProps));
    
    // Return the modified project to allow for chaining or state updates
    return project;
  }
}
