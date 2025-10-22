
import { Diagram, type DiagramProperties, type DiagramType } from './diagram';

export type DiagramsData = Partial<Record<DiagramType, DiagramProperties>>;

/**
 * The DiagramManager class encapsulates the collection of diagrams within a project.
 * It is responsible for creating, updating, and serializing Diagram instances.
 */
export class DiagramManager {
    private diagrams: Partial<Record<DiagramType, Diagram>>;

    /**
     * @param data The initial raw data for the diagrams, mapping diagram types to their properties.
     *             This constructor is defensive to handle malformed data from older project versions.
     */
    constructor(data?: any | null) { // Use `any` to gracefully handle legacy formats
        this.diagrams = {};

        // Defensively find the actual map of diagrams.
        // It could be the `data` object itself, or nested inside `data.diagrams` in legacy formats.
        const dataToProcess = (data && data.diagrams && typeof data.diagrams === 'object') ? data.diagrams : data;

        if (dataToProcess && typeof dataToProcess === 'object') {
            for (const key in dataToProcess) {
                if (Object.prototype.hasOwnProperty.call(dataToProcess, key)) {
                    const type = key as DiagramType;
                    const diagramData = dataToProcess[type];
                    
                    // Create a diagram instance only if the data is a valid-looking object with content.
                    if (diagramData && typeof diagramData === 'object' && Object.keys(diagramData).length > 0) {
                        this.diagrams[type] = new Diagram(diagramData);
                    }
                }
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
        return Object.keys(this.diagrams).length > 0;
    }

    /**
     * Serializes the entire collection of diagrams into a plain data object.
     * This is used for saving the project state.
     * @returns A plain object mapping diagram types to their raw properties.
     */
    public toJSON(): DiagramsData {
        const plainData: DiagramsData = {};
        for (const key in this.diagrams) {
            const type = key as DiagramType;
            const diagramState = this.diagrams[type]?.toStateObject();
            if (diagramState) {
               plainData[type] = diagramState;
            }
        }
        return plainData;
    }
}
