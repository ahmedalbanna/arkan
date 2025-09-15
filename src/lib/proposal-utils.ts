// Helper to check if a value is considered to have content
export const hasContent = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    // Check if an object's properties are all empty
    if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.values(value).some(hasContent);
    }
    return true;
};

// Helper to format keys into readable titles
export const formatKeyToTitle = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};
