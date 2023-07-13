Feature: Edit task

  As a logged in user
  I want to edit a task in the application

  Scenario: Editing a task in the Todo List app
    Given I am on a logged in user
    When I click the "Edit" button of the task
    And I update the task description
    And I click on the "Save" button
    Then the task should be updated with the new description
