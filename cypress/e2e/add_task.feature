Feature: Add new task

  As a logged in user
  I want to add a new task to the application

  Scenario: User adds a new task
    Given I am on a logged in user
    When I typing new task
    And I submit the task form
    Then the new task should be visible on the application page