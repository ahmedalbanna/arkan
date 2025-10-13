// Core Module - العناصر الأساسية الموحدة
// للاستخدام العام (يشمل العميل والخادم)
export * from '../core';

// // للاستخدام المحدد
// export * from './core/client'; // للعميل فقط
// export * from './core/server'; // للخادم فقط

// Firebase client-side initialization
// export * from './firebase/client-init';

// NOTE: Server-side modules like 'db/queries' and 'firebase/server-init'
// have been removed from this barrel file. They should be imported directly
// in server-side files (Server Components, API Routes, etc.) to prevent
// them from being bundled with client-side code.

// Legacy exports - سيتم نقلها إلى Core Module في المراحل القادمة
// export * from './agents';
// export * from './authUtils';
// export * from './errorUtils';
// export * from './proposal-templates';
// export * from './query-keys';
// export * from './types';
// export * from './agents-template';
// export * from './diff';
// export * from './pptx-styles';
