const cucumber = require("cypress-cucumber-preprocessor").default;
const { defineConfig } = require("cypress");
const browserify = require("@cypress/browserify-preprocessor");


module.exports = defineConfig({
  //fileServerFolder: string,

  fileServerFolder: "dist",

  preprocessors: {
    ...browserify.defaultOptions,
    typescript: {
      ...browserify.defaultOptions.typescript,
      typescript: require.resolve("typescript"),
    },
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  testFramework: "cucumber",

  e2e: {
    supportFile: "cypress/support/index.js",

    setupNodeEvents(on, config) {
      on('file:preprocessor', cucumber())

    },

    specPattern: "cypress/e2e/**/*.feature",
  },
});
