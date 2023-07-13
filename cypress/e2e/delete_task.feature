Feature: Delete task

  As a logged in user
  I want to delete a task in the application

  Scenario: User deleting a task
    Given I am on a logged in user
    When I click the "Delete" button
    Then the task should no longer be visible on the list
