import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";

let testUser = {email: 'test@gmail.com', password: 'test'}

Given('I am on the login page', () => {
    cy.visit('https://localhost:8080/signin')
})

When('I enter username and password', () => {

        cy.intercept('POST', 'https://localhost:8080/sessions', (req) => {
            req.reply((res) => {
                res.send({
                    sessionToken: "fb8106c9-0f3a-4bc2-9e07-8d150eb9dcca"
                })
            })
        }).as('loginRequest')

        cy.get('input[data-cy=signin-email]').type(testUser.email);
        cy.get('input[data-cy=signin-password]').type(testUser.password);
        cy.get('button[data-cy=submit]').click();

        cy.wait('@loginRequest');
})

And('I should see the application page', () => {
    cy.url().should('contains', 'https://localhost:8080/todos');
})

When('I click on the logout link', () => {
    cy.intercept('DELETE', '/sessions', {
        statusCode: 200,
        body: {}
    }).as('logoutRequest');

    cy.get('button[data-cy=signout-submit]').click();

    cy.wait('@logoutRequest');
})

Then('I should see the main page', () => {
    cy.url().should('contains', 'https://localhost:8080');
})