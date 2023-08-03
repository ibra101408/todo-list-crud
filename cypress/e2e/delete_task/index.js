import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";

let deletedTask = null;

Given('I am on a logged in user', () => {
    cy.fixture('testUser').then(testUser => {
        cy.createUser(testUser);
        cy.signIn(testUser);
        cy.visit('https://localhost:8080/todos.html');
        // Wait for the WebSocket connection to be stable
        cy.wait(500); // Adjust the time as needed

    });
});

When('I click the "Delete" button', () => {
    cy.intercept('DELETE', '/items/*').as('delete-todo')

    cy.get('ul[data-cy=list]').within(() => {
        // Get all li elements
        cy.get('li').then($lis => {
            // Generate a random index within the range of li elements
            const randomIndex = Math.floor(Math.random() * $lis.length);
            // Select the random li element at the generated index
            const $randomLi = $lis.eq(randomIndex);
            // Save the task value for verification
            deletedTask = $randomLi.find('.task-description').text().trim();
            // Perform the delete action on the random li element
            $randomLi.find('button[data-cy=delete-button]').click();
        });
    });

    cy.wait('@delete-todo')
});

Then('the task should no longer be visible on the list', () => {
    // Check if the deleted task value does not exist within the list
    cy.get('ul[data-cy=list]').should('not.contain', deletedTask);
});
