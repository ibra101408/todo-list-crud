import 'core-js/modules/es.promise';
import 'core-js/modules/es.array.iterator';
import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";

const randomEmail = Math.random().toString(36).substring(2) + '@example.com'
const randomPassword = Math.random().toString(36).substring(2)

Given('I am on the signup page', () => {
    cy.visit('https://localhost:8080/signup.html')
})

When('I enter a new username and a new password and click on the signup button', () => {
    cy.get('input[data-cy=signup-email]').click().type(randomEmail, { force: true })
    cy.get('input[data-cy=signup-password]').click().type(randomPassword, { force: true })
    cy.get('button[data-cy=signup-submit]').click()
})

And('I should see the signin page', () => {
    cy.url().should('contains', 'https://localhost:8080/signin.html');
})
When('I enter the username and the password and click on the signin button', () => {
    cy.get('input[data-cy=signin-email]').type(randomEmail);
    cy.get('input[data-cy=signin-password]').type(randomPassword);
    cy.get('button[data-cy=submit]').click();
})

Then('I should see the application page', () => {
    cy.url().should('contains', 'https://localhost:8080/todos.html');
})
