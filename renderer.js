import { sha256 } from "sha.js";
import { createConnection } from "mysql2";

const func = async () => {
  const response = await window.versions.ping();
  console.log(response); //prints out 'pong'
};

func();

var connection = createConnection({
  host: "nadya59k.beget.tech",
  user: "nadya59k_55",
  password: "nZU6%Dw4",
  database: "nadya59k_55",
});

connection.connect();

let username = document.getElementById("username").value;

let password = document.getElementById("password").value;

let encrypt = (passwrd) => {
  let encrr_pas = new sha256(`${password}`).update("42").digest("hex");
  return encrr_pas;
};

console.log(`${password}`);

let encrypted_password = encrypt(password);

connection.query(
  `INSERT INTO users_data(username, password) VALUES('${username}', '${encrypted_password}')`,
  (error, results, fields) => {
    console.log(results);
  }
);

connection.end();
