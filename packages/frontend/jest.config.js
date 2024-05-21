export default {
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': 'swc-jest',
  },
};