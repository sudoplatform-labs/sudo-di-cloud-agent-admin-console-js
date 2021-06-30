module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/e2e/**/*.test.ts',
  ],
  globalSetup: '<rootDir>/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/e2e/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/e2e/setup-tests.ts'],
  coverageDirectory: 'coverage-e2e',
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx}",
    "!<rootDir>/**/*.d.ts",
    "!<rootDir>/src/test/**/*.{ts,tsx}",
    "!<rootDir>/e2e/**/*.{ts,tsx}",
    "!<rootDir>/src/**/*.spec.{ts,tsx}",
  ],
  coverageReporters: [
    "html",
    "text",
    "text-summary"
  ],
};
