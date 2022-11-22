const inquirer = require("inquirer");
const mysql = require("mysql");
require("console.table");


// could use .env file to hide password/username with .gitignore but probably won't bother this time
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "<PLACEHOLDER_DB>"
});


// connects to sql server + database
connection.connect(function (err) {
    if (err) throw err;
    // first prompt ran by inquirer for the user to choose what they want to do
    starterPrompt();
  });

  // function which prompts the user for what action they should take
function starterPrompt() {
    inquirer.prompt({
        type: "list",
        name: "task",
        message: "Choose from the list what you would like to do",
        choices: [
          "View Employees",
          "View Employees by Department",
          "Add Employee",
          "Remove Employees",
          "Update Employee Role",
          "Add Role",
          "End"]
      })

      .then(function ({ task }) {
        switch (task) {
          case "View Employees":
            viewEmployee();
            break;

          case "View Employees by Department":
            viewEmployeeByDepartment();
            break;
          
          case "Add Employee":
            addEmployee();
            break;

          case "Remove Employees":
            removeEmployees();
            break;

          case "Update Employee Role":
            updateEmployeeRole();
            break;

          case "Add Role":
            addRole();
            break;
  
          case "End":
            connection.end();
            break;
        }
      });
  }