const express = require("express");
var mysql = require("mysql2");
var sha = require("sha.js");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.use(express.json());

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function encrypt(password, salt) {
  const combined = salt + password;
  // Hash the combined string
  const hash = sha("sha256").update(combined).digest("hex");
  return [hash, salt];
}

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

// Does not use encrypted password and just encrypts the password itself
app.get(
  "/danger_zone/users/get_is_user_password_correct/id/:id/password/:password",
  (req, res) => {
    connection.query(
      `SELECT password, salt FROM users_data WHERE id = '${req.params.id}'`,
      (error, results, fields) => {
        if (error) {
          console.error("Error executing query: " + error);
          return;
        }

        let answer = {
          isCorrect:
            encrypt(req.params.password, results[0].salt)[0] ===
            results[0].password,
        };
        res.send(answer);
      }
    );
  }
);

app.post("/danger_zone/users/insert_new_user_into_database/", (req, res) => {
  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send("Send valid Json");
  }
  const UserData = req.body;
  if (!UserData.hasOwnProperty("username")) {
    res.status(400).send("Json must have username in it");
  }
  if (!UserData.hasOwnProperty("password")) {
    res.status(400).send("Json must have password in it");
  }
  const [hash, salt] = encrypt(UserData.password, generateSalt());
  connection.query(
    `INSERT INTO users_data(username, password, salt) VALUES ('${UserData.username}', '${hash}', '${salt}')`,
    (error, results, fields) => {
      if (error) {
        console.error("Error executing query: " + error);
        return;
      }
      res.status(201).send("User created");
    }
  );
});

app.get("/users/get_user_from_id/:id", (req, res) => {
  connection.query(
    `SELECT username FROM users_data WHERE id = '${req.params.id}'`,
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
    `SELECT id FROM users_data WHERE username = '${req.params.username}'`,
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
  "/users/get_is_user_password_correct/id/:id/encrypted_passw/:encrypted_password",
  (req, res) => {
    connection.query(
      `SELECT password, salt FROM users_data WHERE id = '${req.params.id}'`,
      (error, results, fields) => {
        if (error) {
          console.error("Error executing query: " + error);
          return;
        }
        let answer = {
          isCorrect:
            encrypt(res.params.encrypted_password, resulsts[0].salt) ===
            results[0].password,
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
