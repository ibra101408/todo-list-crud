import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";

let testUser = {email: 'test@gmail.com', password: 'test'}

Given('I am on the login page', () => {
    cy.visit('https://localhost:8080/signin')
})

When('I enter username and password', () => {
    cy.get('input[data-cy=signin-email]').type(testUser.email);
    cy.get('input[data-cy=signin-password]').type(testUser.password);
    cy.get('button[data-cy=submit]').click();
})

And('I should see the application page', () => {
    cy.url().should('contains', 'https://localhost:8080/todos');
})

When('I click on the logout link', () => {
    cy.get('button[data-cy=signout-submit]').click();
})
Then('I should see the main page', () => {
    cy.url().should('contains', 'https://localhost:8080');
})