/// <reference types="cypress" />

describe('deleteTask', () => {
    it("should delete a user's task", () => {
    cy.visit('https://localhost:8080/');
            cy.contains('a', 'Sign In').click();
            cy.get('#signin-email').click();
            cy.get('#signin-email').type('existing_user');
            cy.get('#signin-password').click();
            cy.get('#signin-password').type('1234');
            cy.get('#signin-submit').click();
            cy.url().should('contains', 'https://localhost:8080/todos');
            // Check if the text "delete me" exists and delete the item
            cy.contains('.list-wrapper li', 'delete me', { matchCase: false })
                .then(($item) => {
                    if ($item.length > 0) {
                        $item.find('.delete-btn').click();
                    } else {
                        // Handle the case when the text "delete me" is not found
                        cy.log("Text 'delete me' not found");
                    }
                });
    });
});
