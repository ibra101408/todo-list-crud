// cypress/support/index.d.ts
// Import Cypress commands
require("./commands.js");


declare namespace Cypress {
    interface Chainable {
        createUser(user: any): void;

        signIn(user: any): void;
    }
}
