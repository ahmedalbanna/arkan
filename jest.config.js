module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle module aliases from tsconfig.json
    // Add other aliases as needed from your tsconfig.json
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/ai/(.*)$': '<rootDir>/src/ai/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
  },
  // A list of paths to modules that run some code to configure or set up the testing framework before each test.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    // Use ts-jest for .ts and .tsx files
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // By default, node_modules are not transformed by Jest.
  // We need to transform ESM-only packages from the unified ecosystem.
  transformIgnorePatterns: [
    '/node_modules/(?!(unified|remark-.*|rehype-.*|unist-.*|hast-.*|mdast-.*|micromark.*|vfile.*)/)',
  ],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
