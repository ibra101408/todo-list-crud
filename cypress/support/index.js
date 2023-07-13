// Import Cypress commands
require("./commands.js");

// This file is used for any additional setup or configuration you may need for your login

// Custom Cypress commands or configuration can be added here

// You can also import and configure any additional testing libraries or plugins

// For example, if you are using a popular assertion library like Chai, you can import and configure it here
// const chai = require("chai");
// const chaiDom = require("chai-dom");
//
// chai.use(chaiDom);

// Alternatively, you can define custom Cypress commands by extending the Cypress namespace
Cypress.Commands.add("login", (username, password) => {
    // Custom login command implementation
});

// Export the necessary objects or functions if needed
// module.exports = {
//   myCustomFunction: myCustomFunction,
//   myCustomObject: myCustomObject,
// };
