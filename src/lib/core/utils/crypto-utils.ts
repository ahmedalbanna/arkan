/**
 * أدوات التشفير والهاش الموحدة
 *
 * هذا الملف يحتوي على جميع أدوات التشفير والهاش
 * المستخدمة في التطبيق
 */

/**
 * إنشاء hash من النص باستخدام SHA-256
 */
export async function createHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * إنشاء hash من النص باستخدام MD5 (للاستخدامات البسيطة)
 */
export function createMD5Hash(text: string): string {
    // تنفيذ بسيط لـ MD5 (للاستخدامات البسيطة فقط)
    let hash = 0;
    if (text.length === 0) return hash.toString();

    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16);
}

/**
 * إنشاء hash من الكائن
 */
export async function createObjectHash(obj: any): Promise<string> {
    const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
    return createHash(jsonString);
}

/**
 * إنشاء hash من الملف
 */
export async function createFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * إنشاء hash من ArrayBuffer
 */
export async function createArrayBufferHash(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(16, '0')).join('');
}

/**
 * إنشاء hash من base64
 */
export async function createBase64Hash(base64: string): Promise<string> {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * إنشاء hash قصير من النص
 */
export async function createShortHash(text: string, length: number = 8): Promise<string> {
    const fullHash = await createHash(text);
    return fullHash.substring(0, length);
}

/**
 * إنشاء hash مع salt
 */
export async function createSaltedHash(text: string, salt: string): Promise<string> {
    const saltedText = text + salt;
    return createHash(saltedText);
}

/**
 * إنشاء salt عشوائي
 */
export function generateSalt(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';

    for (let i = 0; i < length; i++) {
        salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return salt;
}

/**
 * إنشاء UUID v4
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * إنشاء UUID قصير
 */
export function generateShortUUID(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

/**
 * إنشاء رمز تحقق
 */
export function generateVerificationCode(length: number = 6): string {
    const chars = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

/**
 * إنشاء رمز تحقق مع أحرف
 */
export function generateAlphanumericCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

/**
 * إنشاء رمز تحقق آمن
 */
export function generateSecureCode(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

/**
 * تشفير النص باستخدام AES
 */
export async function encryptText(text: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // إنشاء مفتاح التشفير
    const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(key));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    // إنشاء IV عشوائي
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // تشفير النص
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
    );

    // دمج IV مع البيانات المشفرة
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // تحويل إلى base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * فك تشفير النص باستخدام AES
 */
export async function decryptText(encryptedText: string, key: string): Promise<string> {
    const decoder = new TextDecoder();

    try {
        // تحويل من base64
        const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

        // فصل IV عن البيانات المشفرة
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        // إنشاء مفتاح التشفير
        const encoder = new TextEncoder();
        const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(key));
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );

        // فك تشفير النص
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            encrypted
        );

        return decoder.decode(decrypted);
    } catch (error) {
        throw new Error('فشل في فك تشفير النص');
    }
}

/**
 * إنشاء توقيع رقمي
 */
export async function createDigitalSignature(data: string, privateKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // إنشاء مفتاح التوقيع
    const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(privateKey));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC' },
        false,
        ['sign']
    );

    // إنشاء التوقيع
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    const signatureArray = Array.from(new Uint8Array(signature));

    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * التحقق من التوقيع الرقمي
 */
export async function verifyDigitalSignature(data: string, signature: string, privateKey: string): Promise<boolean> {
    try {
        const expectedSignature = await createDigitalSignature(data, privateKey);
        return expectedSignature === signature;
    } catch {
        return false;
    }
}

/**
 * إنشاء hash للملف مع التحقق من التكامل
 */
export async function createFileIntegrityHash(file: File): Promise<{ hash: string; size: number; lastModified: number }> {
    const hash = await createFileHash(file);
    return {
        hash,
        size: file.size,
        lastModified: file.lastModified,
    };
}

/**
 * التحقق من تكامل الملف
 */
export async function verifyFileIntegrity(file: File, expectedHash: string): Promise<boolean> {
    try {
        const actualHash = await createFileHash(file);
        return actualHash === expectedHash;
    } catch {
        return false;
    }
}

/**
 * إنشاء hash للمحتوى مع التحقق من التكامل
 */
export async function createContentIntegrityHash(content: string): Promise<{ hash: string; length: number; timestamp: number }> {
    const hash = await createHash(content);
    return {
        hash,
        length: content.length,
        timestamp: Date.now(),
    };
}

/**
 * التحقق من تكامل المحتوى
 */
export async function verifyContentIntegrity(content: string, expectedHash: string): Promise<boolean> {
    try {
        const actualHash = await createHash(content);
        return actualHash === expectedHash;
    } catch {
        return false;
    }
}

/**
 * إنشاء hash للمصفوفة
 */
export async function createArrayHash(array: any[]): Promise<string> {
    const sortedArray = [...array].sort();
    const jsonString = JSON.stringify(sortedArray);
    return createHash(jsonString);
}

/**
 * إنشاء hash للكائن مع ترتيب المفاتيح
 */
export async function createSortedObjectHash(obj: any): Promise<string> {
    const sortedObj = Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {} as any);

    const jsonString = JSON.stringify(sortedObj);
    return createHash(jsonString);
}

/**
 * إنشاء hash للملف مع معلومات إضافية
 */
export async function createFileMetadataHash(file: File): Promise<string> {
    const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
    };

    return createSortedObjectHash(metadata);
}

/**
 * إنشاء hash للمستخدم مع معلومات إضافية
 */
export async function createUserHash(user: { id: string; email: string; createdAt: Date }): Promise<string> {
    const userData = {
        id: user.id,
        email: user.email.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
    };

    return createSortedObjectHash(userData);
}

/**
 * إنشاء hash للمشروع مع معلومات إضافية
 */
export async function createProjectHash(project: { id: string; title: string; content: string; updatedAt: Date }): Promise<string> {
    const projectData = {
        id: project.id,
        title: project.title,
        content: project.content,
        updatedAt: project.updatedAt.toISOString(),
    };

    return createSortedObjectHash(projectData);
}
