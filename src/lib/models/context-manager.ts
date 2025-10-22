

// This type was moved from project.ts to here, as it's only used by the ContextManager.
export type ContextFileType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';

/**
 * Represents the data structure for a single external context file.
 */
export interface ContextFileData {
    fileName: string;
    content: string;
    type: ContextFileType;
}

/**
 * The ContextManager class encapsulates the logic for managing a collection of external context files.
 */
export class ContextManager {
    private files: ContextFileData[];

    /**
     * @param data The initial array of context file data.
     */
    constructor(data?: ContextFileData[] | null) {
        this.files = data || [];
    }

    /**
     * Adds a new context file to the collection.
     * @param fileName The name of the file.
     * @param content The content of the file.
     * @param type The type of the context file.
     */
    public add(fileName: string, content: string, type: ContextFileType): void {
        this.files.push({ fileName, content, type });
    }

    /**
     * Removes a context file from the collection by its index.
     * @param index The index of the file to remove.
     */
    public remove(index: number): void {
        if (index >= 0 && index < this.files.length) {
            this.files.splice(index, 1);
        }
    }

    /**
     * Updates the type of a specific context file.
     * @param index The index of the file to update.
     * @param type The new type for the context file.
     */
    public updateType(index: number, type: ContextFileType): void {
        if (this.files[index]) {
            this.files[index].type = type;
        }
    }

    /**
     * Retrieves all context files.
     * @returns An array of all context file data.
     */
    public getAll(): ContextFileData[] {
        return this.files;
    }

    /**
     * Checks if there are any context files.
     * @returns True if there is at least one file, false otherwise.
     */
    public hasContent(): boolean {
        return this.files.length > 0;
    }

    /**
     * Serializes the manager's state into a plain array for storage.
     * @returns An array of plain objects representing the context files.
     */
    public toJSON(): ContextFileData[] {
        return this.files;
    }
}
