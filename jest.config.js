/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@testing-library)/)"
  ],
  moduleNameMapper: {
    "^(.+\\.css)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
    "**/*.test.ts",
    "**/*.test.tsx",
  ],
};
