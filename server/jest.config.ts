import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  testTimeout: 300000,

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^../../services/mail$": "<rootDir>/src/__tests__/__mocks__/mail.ts",
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
        isolatedModules: true,
      },
    ],
  },

  transformIgnorePatterns: [
    "node_modules/(?!(@types)/|socket.io|multer|jsonwebtoken|bcryptjs|passport)",
  ],

  testPathIgnorePatterns: ["/node_modules/"],
};

export default config;
