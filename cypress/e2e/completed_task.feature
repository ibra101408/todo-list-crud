Feature: Mark task as Complete

  As a logged in user
  I want to mark a task as completed in the application

  Scenario: User marks a task as complete
    Given I am on a logged in user
    When I click the "Completed" button of a task
    Then the task should be marked as complete