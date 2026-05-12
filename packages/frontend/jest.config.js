module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@tanstack/react-query|@radix-ui)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/playwright/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'tests/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.ts', '**/tests/unit/**/*.test.tsx', '**/tests/unit/**/*.spec.ts'],
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.ts'],
    },
  ],
};