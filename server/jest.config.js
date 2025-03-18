/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  reporters: [
    "default",
    [
      "jest-junit", // XML report for automation
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
