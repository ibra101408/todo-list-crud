// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('createUser', (user) => {
    try {
        cy.request({
            method: 'POST',
            url: 'https://localhost:8080/sessions',
            body: user,
            failOnStatusCode: false
        }).then((response) => {
            // Check if the user was not created
            if (response.status !== 201 && response.status !== 409) {
                throw new Error('User was not created');
            }
        })
    } catch (e) {
        console.log(e);
    }
})

Cypress.Commands.add('signIn', (user) => {
    cy.request({
        method: 'POST',
        url: 'https://localhost:8080/sessions',
        body: user
    }).then((response) => {
        if (response.status !== 201) {
            throw new Error('User was not signed in');
        }
        window.localStorage.setItem('sessionToken', response.body.sessionToken);
    });
})
