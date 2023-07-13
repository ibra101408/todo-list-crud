import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";

Given('I am on a logged in user', () => {
    cy.fixture('testUser').then(testUser => {
        cy.createUser(testUser);
        cy.signIn(testUser);
        cy.visit('https://localhost:8080/todos');
    });
});

When('I click the "Completed" button of a task', () => {
    cy.get('[data-cy="complete-btn"]').then($buttons => {
        // Generate a random index within the range of available buttons
        let randomIndex = Cypress._.random(0, $buttons.length - 1);

        // Get the random button and click it
        cy.wrap($buttons[randomIndex]).click();

        // Store the random index in a Cypress custom alias
        cy.wrap(randomIndex).as('randomIndex');
    });
});

Then('the task should be marked as complete', () => {
    // Retrieve the random index from the Cypress custom alias
    cy.get('@randomIndex').then(randomIndex => {
        // Verify that the selected task is marked as complete
        cy.get('[data-cy="is-completed"]').eq(randomIndex).should('have.class', 'completed');
    });
});
