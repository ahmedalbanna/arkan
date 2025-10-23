
import { Diagram, type DiagramProperties, type DiagramType } from './diagram';

/**
 * The DiagramManager class encapsulates the collection of diagrams within a project.
 * It is responsible for creating, updating, and serializing Diagram instances.
 */
export class DiagramManager {
    private diagrams: Record<string, Diagram>;

    /**
     * @param data The initial raw data for the diagrams, mapping diagram types to their properties.
     */
    constructor(data?: Record<string, DiagramProperties> | null) {
        this.diagrams = {};
        if (data) {
            for (const key in data) {
                // Create a new Diagram instance for each data entry.
                this.diagrams[key] = new Diagram(data[key]);
            }
        }
    }

    /**
     * Retrieves a specific diagram instance by its type.
     * @param type The type of the diagram to retrieve.
     * @returns The Diagram instance or undefined if it doesn't exist.
     */
    public getDiagram(type: DiagramType): Diagram | undefined {
        return this.diagrams[type];
    }

    /**
     * Creates or updates a diagram.
     * @param type The type of the diagram.
     * @param data The properties for the diagram.
     */
    public updateDiagram(type: DiagramType, data: DiagramProperties): void {
        this.diagrams[type] = new Diagram(data);
    }

    /**
     * Checks if there are any diagrams in the manager.
     * @returns True if there is at least one diagram, false otherwise.
     */
    public hasContent(): boolean {
        return Object.values(this.diagrams).some(diagram => diagram.hasContent());
    }

    /**
     * Serializes the entire collection of diagrams into a plain data object.
     * @returns A plain object mapping diagram types to their raw properties.
     */
    public toJSON(): Record<string, DiagramProperties> {
        const data: Record<string, DiagramProperties> = {};
        for (const key in this.diagrams) {
            data[key] = this.diagrams[key].toStateObject();
        }
        return data;
    }
}
