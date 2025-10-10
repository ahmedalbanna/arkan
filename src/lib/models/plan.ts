
// تعريف الكلاس الخاص بمهمة المشروع
export class ProjectTask {
    title: string;
    description: string;
    acceptanceCriteria: string[];
    status: 'To Do' | 'In Progress' | 'Done';

    constructor(data: {
        title: string;
        description: string;
        acceptanceCriteria: string[];
        status?: 'To Do' | 'In Progress' | 'Done';
    }) {
        this.title = data.title;
        this.description = data.description;
        this.acceptanceCriteria = data.acceptanceCriteria;
        this.status = data.status ?? 'To Do';
    }
}

// تعريف الكلاس الخاص بمرحلة المشروع
export class ProjectPhase {
    phaseName: string;
    tasks: ProjectTask[];

    constructor(data: {
        phaseName: string;
        tasks: ProjectTask[];
    }) {
        this.phaseName = data.phaseName;
        this.tasks = data.tasks;
    }
}

// تعريف الكلاس الخاص بخطة المشروع
export class ProjectPlan {
    phases: ProjectPhase[];

    constructor(data: {
        phases: ProjectPhase[];
    }) {
        this.phases = data.phases;
    }
}
