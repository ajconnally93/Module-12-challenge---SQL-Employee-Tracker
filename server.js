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
    if (err) console.error("Could not connect to Database");
    starterPrompt();
  });

  // function which prompts the user for what action they should take
  // ALL FUNCTIONS ADDED AFTER THIS WILL BE CALLED BASE ON THE USER'S CHOICE. This is the HEART of the application
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

// ALL FUNCTIONS ADDED AFTER THIS WILL BE CALLED BASE ON THE USER'S CHOICE. This is the HEART of the application
      .then(function ({ task }) {
        switch (task) {
          case "View Employees":
            viewEmployee();
            break;

          case "View Employee by Department":
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
      if (err) console.error("viewEmployee function error");
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
      if (err) console.error("viewEmployeeByDepartment function error");
  
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


// will show departments and is called in viewEmployeesByDepartment() function
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
      // instance of where I maybe could test out the use of -this- in reference to main object
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
          if (err) console.error("promptDepartment function error");
  
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
      if (err) console.error("addEmployee function error");
  
    //   be careful with backticks, can lead to SQL injection
      const roleChoices = res.map(({ id, title, salary }) => ({
        value: id, title: `${title}`, salary: `${salary}`
      }));
  
      console.table(res);
      console.log("Role to insert");
  
      promptInsert(roleChoices);
    });
}

// data returned from this function gets passed through addEmployee function
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
            if (err) console.error("promptInsert function error");
  
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
      if (err) console.error("removeEmployees function error");

    //  again be careful of SQL injection when using backticks. might be able to use .env file? may look into for future projects
      const deleteEmployees = res.map(({ id, first_name, last_name }) => ({
        value: id, name: `${id} ${first_name} ${last_name}`
      }));
  
      console.table(res);
      console.log("array to delete\n");
  
      promptDelete(deleteEmployees);
    });
}

// BREAKING HERE TO TEST SOME FUNCTIONALITY BEFORE MOVING ON
// ADDING EMPLOYEE WORKS
// CONSOLE LOGS APPEAR PROPERLY


// will ask User which employee to delete when called inside of removeEmployees() function
function promptDelete(deleteEmployees) {
  inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee would you like to remove?",
        choices: deleteEmployees
      }
    ])

    .then(function (answer) {
      var query = `DELETE FROM employee WHERE ?`;
      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) console.error("Error Deleting Employee");
        console.table(res);
        console.log(res.affectedRows + "Deleted\n");
        starterPrompt();
      });
    });
}


function employeeArray() {
  console.log("Updating employee:");
  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) console.error("Error updating employee role");
    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));
    
    console.table(res);
    console.log("employeeArray updated\n")
    roleArray(employeeChoices);
  });
}

function updateEmployeeRole() { 
  employeeArray();
}


function roleArray(employeeChoices) {
  console.log("TEST LOG for roleArray function");
  var query =
    `SELECT r.id, r.title, r.salary 
  FROM role r`

  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) console.error("roleArray error");
    roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`      
    }));

    console.table(res);
    console.log("roleArray updated\n")
    promptEmployeeRole(employeeChoices, roleChoices);
  });
}


// will prompt Employee Role to be updated/set when called in roleArray function
function promptEmployeeRole(employeeChoices, roleChoices) {
  inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with this role?",
        choices: employeeChoices
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role would you like to update?",
        choices: roleChoices
      },
    ])
    .then(function (answer) {
      var query = `UPDATE employee SET role_id = ? WHERE id = ?`
      // when finished prompting insert a new item into employeesDB
      connection.query(query,
        [ answer.roleId,  
          answer.employeeId
        ],
        function (err, res) {
          if (err) console.error("promptEmployeeRole function error");

          console.table(res);
          console.log(res.affectedRows + "Updated");

          starterPrompt();
        });
    });
}

// BREAKING CODE UP HERE AGAIN TO TEST NEW FUNCTIONS
// ALL WORKING AS INTENDED

function addRole() {
  var query =
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) console.error("addRole function error");

    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    console.log("Department array");

    promptAddRole(departmentChoices);
  });
}


// will prompt user to add role when called inside the addRole() function
function promptAddRole(departmentChoices) {
  inquirer.prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title: "
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role salary: "
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department: ",
        choices: departmentChoices
      },
    ])

    // may test with this.title and this.salary and this.departmentId, because -this- refers to the object
    .then(function (answer) {
      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) console.error("promptAddRole function error");

          console.table(res);
          console.log("Role Inserted");

          starterPrompt();
        });
    });
}
