import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";

Given('I am on a logged in user', () => {
    cy.fixture('testUser').then(testUser => {
        cy.createUser(testUser);
        cy.signIn(testUser);
        cy.visit('https://localhost:8080/todos');
    });
});

When('I click the "Edit" button of the task', () => {
    cy.intercept('PUT', '/items/*').as('edit-todo'); // Use cy.route instead of cy.intercept

    cy.get('[data-cy="edit-button"]').then($editButtons => {
        const randomIndex = Math.floor(Math.random() * $editButtons.length);
        const randomEditButton = $editButtons.eq(randomIndex);
        randomEditButton.click();
    });
});

And('I update the task description', () => {
    const newDescription = "Updated task description";
    cy.get('[data-cy="edit-description"]').type(newDescription);
});

And('I click on the "Save" button', () => {
    cy.get('[data-cy="update-button"]').click();
    cy.wait('@edit-todo');
});

Then('the task should be updated with the new description', () => {
    const updatedDescription = "Updated task description";
    cy.get('.task-description').contains(updatedDescription).should('exist');
});