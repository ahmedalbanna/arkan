
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

    const normalizedProject: any = {
      ...projectData,
      name: projectData.name || 'Untitled Project',
      meta: {
        author: projectData.meta?.author || userId,
        updated: projectData.meta?.updated || new Date().toISOString(),
        created: projectData.meta?.created || new Date().toISOString(),
        tags: projectData.meta?.tags || [],
      },
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

    // 2. Persist
    return this.projectRepository.save(validatedData);
  }
}
