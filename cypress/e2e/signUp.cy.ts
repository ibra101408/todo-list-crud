const randomEmail = Math.random().toString(36).substring(2) + '@example.com'
const randomPassword = Math.random().toString(36).substring(2)

describe('Signup', () => {

    it('should signup a new user', () => {
        cy.visit('http://localhost:8080/')
        cy.contains('a', 'Sign Up').click()
        cy.get('#signup-email').click().type(randomEmail, { force: true })
        cy.get('#signup-email').should('have.value', randomEmail,)
        cy.get('#signup-password').click().type(randomPassword, { force: true })
        cy.get('#signup-password').should('have.value', randomPassword)
        cy.get('#signup-submit').click()

    })

    it('should not signup a user with an existing email', () => {
        const alertStub = cy.stub()
        cy.on('window:alert', alertStub)
        cy.visit('http://localhost:8080/')
        cy.contains('a', 'Sign Up').click()
        cy.get('#signup-email').click().type("existing_user", { force: true })
        cy.get('#signup-email').should('have.value', "existing_user",)
        cy.get('#signup-password').click().type(randomPassword, { force: true })
        cy.get('#signup-password').should('have.value', randomPassword)
        cy.get('#signup-submit').click()

        cy.wrap(alertStub).should('be.calledWith', 'Error code 409:\nEmail already exists')
    })
})