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

var connection;

let db_config = {
  host: "nadya59k.beget.tech",
  user: "nadya59k_55",
  password: "nZU6%Dw4",
  database: "nadya59k_55",
  connectTimeout: 3000000,
};

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/users/get_all_user_ids", (req, res) => {
  connection.query(`SELECT id FROM users_data`, (error, results, fields) => {
    if (error) {
      console.error("Error executing query: " + error);
      return;
    }
    res.send(convertDatabaseSelectResponseToJson(results, fields));
  });
});

app.get("/users/get_user_from_id/:id", (req, res) => {
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
});

app.get("/users/get_user_id_from_name/:username", (req, res) => {
  connection.query(
    `SELECT id FROM users_data WHERE username = ${req.params.id}`,
    (error, results, fields) => {
      if (error) {
        console.error("Error executing query: " + error);
        return;
      }
      res.send(convertDatabaseSelectResponseToJson(results, fields));
    }
  );
});

app.get(
  "/users/get_is_user_password_correct/:id/:encrypted_password",
  (req, res) => {
    connection.query(
      `SELECT password FROM users_data WHERE id = ${req.params.id}`,
      (error, results, fields) => {
        if (error) {
          console.error("Error executing query: " + error);
          return;
        }
        let answer = {
          isCorrect: res.params.encrypted_password === results.password,
        };
        res.send(answer);
      }
    );
  }
);

app.listen(port, () => {
  //connection.connect();
  console.log(`Backend server listening at http://localhost:${port}`);
});

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });
}

handleDisconnect();

//connection.end();
