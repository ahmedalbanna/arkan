
import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "@/modules/projects/domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "@/modules/projects/domain/repositories/IProjectRepository";
import { Project } from "@/modules/projects/domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { AIContentError } from "../../domain/errors/AIContentErrors";

export interface BuildProjectInput {
    projectId: string;
    selectedChapterIds: string[];
    userId: string;
}

@injectable()
export class BuildProjectUseCase {
    constructor(
        @inject(IProjectRepositoryToken)
        private projectRepository: IProjectRepository
    ) {}

    async execute(input: BuildProjectInput): Promise<Result<Project, AIContentError>> {
        try {
            const projectResult = await this.projectRepository.getById(input.projectId);
            if (projectResult.isFailure) {
                return Result.fail(AIContentError.notFound(`Project ${input.projectId} not found`));
            }

            const project = projectResult.getValue();

            // Validate that the user is the author
            if (project.meta.author !== input.userId) {
                return Result.fail(AIContentError.unauthorized("You are not authorized to build this project."));
            }

            // Move preparation logic from hook/API to use case
            // In a real implementation, this might:
            // 1. Mark chapters/sections for building
            // 2. Prepare context for AI generation
            // 3. Update project metadata
            
            const updatedProject = project.withProps({
                meta: {
                    ...project.meta,
                    updated: new Date().toISOString()
                }
            });

            const saveResult = await this.projectRepository.save(updatedProject.toProperties());
            if (saveResult.isFailure) {
                return Result.fail(AIContentError.saveError(`Failed to save project state: ${saveResult.error?.message || 'Unknown error'}`));
            }

            return Result.ok(saveResult.getValue());
        } catch (error: any) {
            console.error('BuildProjectUseCase Error:', error);
            return Result.fail(AIContentError.internal(`Build failed: ${error.message}`));
        }
    }
}
