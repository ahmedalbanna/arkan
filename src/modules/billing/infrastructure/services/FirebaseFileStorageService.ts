
import { injectable } from "tsyringe";
import { getStorage } from 'firebase-admin/storage';
import { IFileStorageService } from "../../domain/services/IFileStorageService";

@injectable()
export class FirebaseFileStorageService implements IFileStorageService {
    async upload(path: string, file: Buffer, contentType: string): Promise<string> {
        const storage = getStorage();
        const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arkan-docudec.appspot.com');
        const fileRef = bucket.file(path);

        await fileRef.save(file, {
            metadata: { contentType },
        });

        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });

        return url;
    }
}
