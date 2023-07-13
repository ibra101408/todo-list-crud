Feature: Sign in to Application and then Sign out

  As a user I want
  to login to the application
  and then logout

  Scenario: Login to Application and then Logout
    Given I am on the login page
    When I enter username and password
    And I should see the application page
    When I click on the logout link
    Then I should see the main page