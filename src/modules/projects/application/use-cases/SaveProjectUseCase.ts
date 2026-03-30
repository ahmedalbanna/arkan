
import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { Project, ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { ProjectSchema } from "../../domain/schemas/ProjectSchema";

@injectable()
export class SaveProjectUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectData: ProjectProperties, userId: string): Promise<Result<Project, ProjectError>> {
    const normalizeContentItem = (item: any): any => {
      if (!item) return item;
      const itemType = item.itemType || item.type || (item.sections ? 'chapter' : 'section');
      if (itemType === 'chapter') {
        return {
          ...item,
          itemType: 'chapter',
          sections: Array.isArray(item.sections) ? item.sections.map(normalizeContentItem) : [],
        };
      }
      return {
        ...item,
        itemType: 'section',
      };
    };

    const normalizedProject: ProjectProperties = {
      ...projectData,
      content: Array.isArray(projectData.content)
        ? projectData.content.map(normalizeContentItem)
        : [],
    };

    // 1. Validate data against schema
    const validationResult = ProjectSchema.safeParse(normalizedProject);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return Result.fail(ProjectError.validation(`Validation failed: ${errorMessages}`));
    }

    const validatedData = validationResult.data as ProjectProperties;

    // 2. Ensure author is set correctly
    const dataToSave: ProjectProperties = {
      ...validatedData,
      id: validatedData.id || projectData.id, // safeParse might strip id if not in schema properly
      meta: {
        ...validatedData.meta,
        author: userId,
        updated: new Date().toISOString()
      }
    };

    // 3. Persist
    return this.projectRepository.save(dataToSave);
  }
}
