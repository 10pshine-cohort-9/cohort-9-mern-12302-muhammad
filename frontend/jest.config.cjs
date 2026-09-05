const path = require('path');

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.test.cjs') }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'babel\\.config\\.test\\.cjs$'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx', '!src/**/__tests__/**', '!src/__mocks__/**'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov', 'text'],
};
