
// This file is deprecated and will be removed.
// All configuration is now fetched dynamically from the database.
// The content is kept here temporarily only to prevent build errors in other files
// that have not yet been refactored.

interface Section {
    title: string;
    agentId: string;
}

export const reportSections: Record<string, Section> = {
    introduction: { title: 'Introduction', agentId: 'generate-introduction-section' },
    literatureReview: { title: 'Literature Review', agentId: 'generate-literatureReview-section' },
    systemAnalysis: { title: 'System Analysis', agentId: 'generate-systemAnalysis-section' },
    designStrategy: { title: 'Design Strategy', agentId: 'generate-designStrategy-section' },
    systemDesign: { title: 'System Design', agentId: 'generate-systemDesign-section' },
    systemProgramming: { title: 'System Programming', agentId: 'generate-systemProgramming-section' },
    systemTesting: { title: 'System Testing', agentId: 'generate-systemTesting-section' },
    conclusion: { title: 'Conclusion', agentId: 'generate-conclusion-section' },
    abstract: { title: 'Abstract', agentId: 'generate-abstract-section' },
    acknowledgment: { title: 'Acknowledgment', agentId: 'generate-acknowledgment-section' },
    trainingProgram: { title: 'Training Program', agentId: 'generate-trainingProgram-section' },
    technicalExperience: { title: 'Technical Experience', agentId: 'generate-technicalExperience-section' },
    recommendations: { title: 'Recommendations', agentId: 'generate-recommendations-section' },
    references: { title: 'References', agentId: 'generate-references-section' },
    appendices: { title: 'Appendices', agentId: 'generate-appendices-section' },
};

export const diagramSections: Record<string, Section> = {
    useCase: { title: 'Use Case Diagram', agentId: 'generate-useCase-diagram' },
    class: { title: 'Class Diagram', agentId: 'generate-class-diagram' },
    sequence: { title: 'Sequence Diagram', agentId: 'generate-sequence-diagram' },
    activity: { title: 'Activity Diagram', agentId: 'generate-activity-diagram' },
    component: { title: 'Component Diagram', agentId: 'generate-component-diagram' },
    archimate: { title: 'ArchiMate Diagram', agentId: 'generate-archimate-diagram' },
    er: { title: 'ER Diagram', agentId: 'generate-er-diagram' },
}

export const presentationSections: Section = {
    title: 'Presentation',
    agentId: 'generate-presentation'
}
