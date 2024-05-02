const express = require("express");
var mysql = require("mysql2");
var shajs = require("sha.js");

const app = express();
const port = 3000;

app.use(express.json());

function convertDatabaseSelectResponseToJson(results, fields) {
  return results.map((row) => {
    // Convert each row to a JSON object
    const rowJson = {};
    fields.forEach((field) => {
      rowJson[field.name] = row[field.name];
    });
    return rowJson;
  });
}

const encrypt = (password) => {
  let encrr_pas = new sha256(`${passwords}`).update("42").digest("hex");
  return encrr_pas;
};

// Make connection just for the db. Shoukd be changed later

let connection = mysql.createConnection({
  host: "nadya59k.beget.tech",
  user: "nadya59k_55",
  password: "nZU6%Dw4",
  database: "nadya59k_55",
  connectTimeout: 30000,
});

connection.connect();

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/users/get_all_user_ids", (req, res) => {
  connection.connect();
  connection.query(`SELECT id FROM users_data`, (error, results, fields) => {
    if (error) {
      console.error("Error executing query: " + error);
      return;
    }
    res.send(convertDatabaseSelectResponseToJson(results, fields));
  });
  connection.end();
});

app.get("/users/get_user_from_id/:id", (req, res) => {
  connection.connect();
  connection.query(
    `SELECT username FROM users_data WHERE id = ${req.params.id}`,
    (error, results, fields) => {
      if (error) {
        console.error("Error executing query: " + error);
        return;
      }
      res.send(convertDatabaseSelectResponseToJson(results, fields));
    }
  );
  connection.end();
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});

//connection.end();
