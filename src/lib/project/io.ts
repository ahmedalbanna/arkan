import { Project, type ProjectProperties } from '@/lib/models';

/**
 * Creates a Project instance from a file.
 * @param file The project file (.arkan).
 * @returns A promise that resolves with a new Project instance.
 */
export function projectFromFile(file: File): Promise<Project> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                resolve(new Project(json as ProjectProperties));
            } catch (err) {
                reject(new Error("Invalid or corrupted project file."));
            }
        };
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsText(file);
    });
}

/**
 * Downloads the current project state as a .arkan file.
 * @param project The Project instance to download.
 */
export function downloadProjectAsFile(project: Project) {
    if (!project.hasContent()) {
        console.warn("Attempted to download an empty project.");
        return;
    }
    const jsonString = JSON.stringify(project.toStateObject(), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_') || 'project'}.arkan`;
    a.click();
    URL.revokeObjectURL(url);
}
