import { injectable } from "tsyringe";
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import fs from 'fs';
import path from 'path';

@injectable()
export class LocalFileStorageService implements IFileStorageService {
    private readonly baseDir: string;

    constructor() {
        this.baseDir = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'storage');
        this.ensureDirectoryExistence(path.join(this.baseDir, 'uploads'));
    }

    async upload(filePath: string, file: Buffer, _contentType: string): Promise<string> {
        const fullPath = path.join(this.baseDir, 'uploads', filePath);
        this.ensureDirectoryExistence(fullPath);

        await fs.promises.writeFile(fullPath, file);

        // Return the API URL to access the file
        return `/api/storage/uploads/\${filePath}`;
    }

    private ensureDirectoryExistence(filePath: string) {
        const dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        fs.mkdirSync(dirname, { recursive: true });
    }
}
