Feature: Sign up to Application

  As a user I want
  to sign up to the application

  Scenario: Sign up to Application
    Given I am on the signup page
    When I enter a new username and a new password and click on the signup button
    And I should see the signin page
    When I enter the username and the password and click on the signin button
    Then I should see the application page