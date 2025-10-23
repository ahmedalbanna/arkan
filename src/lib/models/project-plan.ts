
// =============================================================================
// DATA INTERFACES
// =============================================================================

export interface ProjectTaskData {
    title: string;
    description: string;
    acceptanceCriteria: string[];
    status: 'To Do' | 'In Progress' | 'Done';
}

export interface ProjectPhaseData {
    phaseName: string;
    tasks: ProjectTaskData[];
}

export interface ProjectPlanData {
    phases: ProjectPhaseData[];
}

// =============================================================================
// CLASS DEFINITIONS
// =============================================================================

export class ProjectTask {
    title: string;
    description: string;
    acceptanceCriteria: string[];
    status: 'To Do' | 'In Progress' | 'Done';

    constructor(data: ProjectTaskData) {
        this.title = data.title;
        this.description = data.description;
        this.acceptanceCriteria = data.acceptanceCriteria;
        this.status = data.status ?? 'To Do';
    }

    public toJSON(): ProjectTaskData {
        return { ...this };
    }

    public static fromJSON(data: ProjectTaskData): ProjectTask {
        return new ProjectTask(data);
    }
}

export class ProjectPhase {
    phaseName: string;
    tasks: ProjectTask[];

    constructor(data: ProjectPhaseData) {
        this.phaseName = data.phaseName;
        this.tasks = data.tasks.map(ProjectTask.fromJSON);
    }

    public toJSON(): ProjectPhaseData {
        return {
            phaseName: this.phaseName,
            tasks: this.tasks.map(task => task.toJSON()),
        };
    }

    public static fromJSON(data: ProjectPhaseData): ProjectPhase {
        return new ProjectPhase(data);
    }
}

export class ProjectPlan {
    phases: ProjectPhase[];

    constructor(data: ProjectPlanData) {
        this.phases = data.phases.map(ProjectPhase.fromJSON);
    }

    public hasContent(): boolean {
        return this.phases.length > 0 && this.phases.some(phase => phase.tasks.length > 0);
    }

    public toJSON(): ProjectPlanData {
        return {
            phases: this.phases.map(phase => phase.toJSON()),
        };
    }

    public static fromJSON(data: ProjectPlanData): ProjectPlan {
        return new ProjectPlan(data);
    }
}
