/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  // testTimeout: 10000,
  setupFiles: ["./tests/setupTests.ts"],
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "./test-reports", outputName: "junit.xml" },
    ],
    [
      "jest-html-reporter",
      {
        pageTitle: "Test Report",
        includeFailureMsg: true,
        outputPath: "./test-reports/index.html",
      },
    ],
  ],
};
