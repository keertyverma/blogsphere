/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Test Report",
        includeFailureMsg: true,
        outputPath: "./test-report/index.html",
      },
    ],
  ],
};
