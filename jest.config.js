
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be important for '@/' imports)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Use ts-jest for ts/tsx files
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Ignore transformers for node_modules, except for specific ES modules
  transformIgnorePatterns: [
    '/node_modules/(?!pdfjs-dist|unified|remark-parse|remark-gfm|unist-util-visit|micromark-util-symbol|lucide-react)/',
  ],
};
