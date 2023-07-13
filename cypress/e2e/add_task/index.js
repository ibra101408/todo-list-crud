import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";

let randTask = Math.random().toString(36).substring(2);

Given('I am on a logged in user', () => {
    cy.fixture('testUser').then(testUser => {
        cy.createUser(testUser);
        cy.signIn(testUser);
        cy.visit('https://localhost:8080/todos');
    });
});

When ('I typing new task', () => {
    cy.get("input[data-cy=add-item-input]").type(randTask);
})

And ('I submit the task form', () => {
    cy.get("button[data-cy=add-item-button]").click();
})

Then('the new task should be visible on the application page', () => {
    cy.contains(randTask).should('exist');
})
