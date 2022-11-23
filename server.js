const inquirer = require("inquirer");
const mysql = require("mysql");
require("console.table");


// could use .env file to hide password/username with .gitignore but probably won't bother this time
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employeesDB"
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

function viewEmployee() {

    console.log("TEST log for viewEmployee function\n");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee m
      ON m.id = e.manager_id`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
      console.table(res);
      console.log("Employees viewed\n");
      starterPrompt();
    });
}


function viewEmployeeByDepartment() {

    console.log("TEST log for viewEmployeeByDepartment function\n");
  
    var query =
      `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
    //   creates MAP array of department choices, filled in by the (data)
      const departmentChoices = res.map(data => ({

        // may test if i could use this.id and this.name with an object, and not with the => type of function call but instead a normal function call
        value: data.id, name: data.name
      }));
  
      console.table(res);
      console.log("Department viewed\n");
  
      promptDepartment(departmentChoices);
    });
}


// Employees will show when department is chosen
function promptDepartment(departmentChoices) {

    // console.log("TEST LOG promptDepartment")

    inquirer.prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Which department would you choose?",
          choices: departmentChoices
        }
      ])
      .then(function (answer) {
        console.log("answer ", answer.departmentId);
  
        var query =
          `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
    FROM employee e
    JOIN role r
      ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    WHERE d.id = ?`
  
        connection.query(query, answer.departmentId, function (err, res) {
          if (err) throw err;
  
          console.table("response ", res);
          console.log(res.affectedRows + "Employees viewed\n");
  
          starterPrompt();
        });
      });
}


function addEmployee() {
    console.log("TEST LOG for addEmployee function")
  
    var query =
      `SELECT r.id, r.title, r.salary 
        FROM role r`
  
    connection.query(query, function (err, res) {
      if (err) throw err;
  
    //   be careful with backticks, can lead to SQL injection
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`
      }));
  
      console.table(res);
      console.log("Role to insert");
  
      promptInsert(roleChoices);
    });
}


function promptInsert(roleChoices) {
    inquirer.prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?"
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "roleId",
          message: "What is the employee's role?",
          choices: roleChoices
        },
      ])
      .then(function (answer) {
        console.log(answer);
  
        var query = `INSERT INTO employee SET ?`
        // when finished prompting, insert a new item into the db with the new info
        connection.query(query,
          {
            first_name: answer.first_name,
            last_name: answer.last_name,
            role_id: answer.roleId,
            manager_id: answer.managerId,
          },
          function (err, res) {
            if (err) throw err;
  
            console.table(res);
            console.log(res.insertedRows + "Inserted successfully\n");
  
            starterPrompt();
          });
      });
}


function removeEmployees() {
    console.log("TEST LOG for removeEmployees function");
  
    var query =
      `SELECT e.id, e.first_name, e.last_name
        FROM employee e`
  
    connection.query(query, function (err, res) {
      if (err) throw err;

    //  again be careful of SQL injection when using backticks. might be able to use .env file? may look into for future projects
      const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${id} ${first_name} ${last_name}`
      }));
  
      console.table(res);
      console.log("array to delete\n");
  
      promptDelete(deleteEmployeeChoices);
    });
}

// BREAKING HERE TO TEST SOME FUNCTIONALITY BEFORE MOVING ON
// ADDING EMPLOYEE WORKS
// CONSOLE LOGS APPEAR PROPERLY

