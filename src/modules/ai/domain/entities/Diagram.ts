/**
 * The properties required to create a new Diagram instance.
 * This is the plain object representation of a diagram's data.
 */
export interface DiagramProperties {
    plantUmlCode: string;
    imageUrl: string;
    explanation?: string;
}

/**
 * Represents a single diagram within a project.
 * It encapsulates the data and logic for a diagram generated from PlantUML.
 */
export class Diagram {
    public readonly plantUmlCode: string;
    public readonly imageUrl: string;
    public readonly explanation?: string;

    constructor(props: DiagramProperties) {
        this.plantUmlCode = props.plantUmlCode;
        this.imageUrl = props.imageUrl;
        this.explanation = props.explanation;
    }

    public withProps(props: Partial<DiagramProperties>): Diagram {
        return new Diagram({
            ...this.toProperties(),
            ...props,
        });
    }

    public toProperties(): DiagramProperties {
        return {
            plantUmlCode: this.plantUmlCode,
            imageUrl: this.imageUrl,
            explanation: this.explanation,
        };
    }

    public toStateObject(): DiagramProperties {
        return this.toProperties();
    }
}
