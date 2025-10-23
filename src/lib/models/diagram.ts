
/**
 * The properties required to create a new Diagram instance.
 * This is the plain object representation of a diagram's data.
 */
export interface DiagramProperties {
    type: DiagramType;
    plantUmlCode: string;
    imageUrl: string;
    explanation?: string;
}

export type DiagramType = 'class' | 'sequence' | 'useCase' | 'activity' | 'component' | 'deployment' |
'state' | 'object' | 'communication' | 'interaction' | 'timing' |
'flowchart' | 'mindmap' | 'gantt' | 'network' | 'er' | 'wireframe' | 'archimate'; // Added 'archimate'

/**
 * Represents a single diagram within a project.
 * It encapsulates the data and logic for a diagram generated from PlantUML.
 */
export class Diagram {
    public type: DiagramType;
    public plantUmlCode: string;
    public imageUrl: string;
    public explanation?: string;

    constructor(props: DiagramProperties) {
        this.type = props.type;
        this.plantUmlCode = props.plantUmlCode;
        this.imageUrl = props.imageUrl;
        this.explanation = props.explanation;
    }

    /**
     * Checks if the diagram has any content.
     * @returns True if the PlantUML code is not empty, false otherwise.
     */
    public hasContent(): boolean {
        return this.plantUmlCode.trim().length > 0;
    }

    /**
     * Updates the PlantUML code for the diagram.
     * @param newCode The new PlantUML code.
     */
    public updateCode(newCode: string): void {
        this.plantUmlCode = newCode;
        // The image URL will become outdated. It should be updated by a separate process.
    }

    /**
     * Updates the explanation for the diagram.
     * @param newExplanation The new explanation text.
     */
    public setExplanation(newExplanation: string): void {
        this.explanation = newExplanation;
    }

    /**
     * Converts the Diagram instance to a plain object for serialization.
     * @returns A plain object representing the diagram's state.
     */
    public toStateObject(): DiagramProperties {
        return {
            type: this.type,
            plantUmlCode: this.plantUmlCode,
            imageUrl: this.imageUrl,
            explanation: this.explanation,
        };
    }
}
