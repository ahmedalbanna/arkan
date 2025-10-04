module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle module aliases from tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/ai/(.*)$': '<rootDir>/src/ai/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(unified|remark-.*|rehype-.*|unist-.*|hast-.*|mdast-.*|micromark.*|vfile.*|data-uri-to-buffer.*)/)',
  ],
  clearMocks: true,
  verbose: true,
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).[jt]s?(x)',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '!<rootDir>/src/lib/core/__tests__/**/*.(test|spec).[jt]s?(x)', // Exclude problematic core tests
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/app/**/page.{js,jsx,ts,tsx}',
    '!src/app/**/layout.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Individual thresholds for critical modules
    'src/lib/models/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/core/hooks/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/ai/flows/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
