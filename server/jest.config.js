/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  
  testTimeout: 30000,
  forceExit: true,
};
