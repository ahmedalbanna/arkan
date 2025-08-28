// export * from './agents';
// export * from './authUtils';
// export * from './errorUtils';

// export * from './proposal-templates';
// export * from './query-keys';

// Re-exporting all types. Note the potential for circular dependencies,
// as `types.ts` itself imports from other files in `lib`. See review below.
// export * from './types';

// Firebase client-side initialization
export * from './firebase/client-init';
// NOTE: Server-side modules like 'db/queries' and 'firebase/server-init'
// have been removed from this barrel file. They should be imported directly
// in server-side files (Server Components, API Routes, etc.) to prevent
// them from being bundled with client-side code.
// The following files were inferred from type definitions but their content was not provided.
// You can uncomment them if they exist and export members.
// export * from './agents-template';
// export * from './diff';
// export * from './pptx-styles';
