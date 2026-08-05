module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.cjs"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: ["<rootDir>/src/**/*.test.{js,jsx,ts,tsx}"],
};
