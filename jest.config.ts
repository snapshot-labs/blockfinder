/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],

    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
    moduleFileExtensions: ['js', 'ts'],
  };
};
