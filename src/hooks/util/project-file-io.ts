import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { v4 as uuidv4 } from 'uuid';

export function projectFromFile(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const props = json as ProjectProperties;
        if (!props.id) {
          props.id = uuidv4();
        }
        resolve(new Project(props));
      } catch {
        reject(new Error("Invalid or corrupted project file."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsText(file);
  });
}

export function downloadProjectAsFile(project: Project) {
  if (!project.hasContent()) {
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

