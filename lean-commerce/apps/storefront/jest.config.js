/**
 * Jest-Konfiguration.
 * Schließt Build-Output (.next) aus, damit keine Haste-Modul-Kollision
 * zwischen package.json und .next/standalone/.../package.json entsteht.
 */
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
