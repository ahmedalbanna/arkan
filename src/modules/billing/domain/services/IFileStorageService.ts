
export interface IFileStorageService {
    upload(path: string, file: Buffer, contentType: string): Promise<string>;
}

export const IFileStorageServiceToken = Symbol("IFileStorageService");
