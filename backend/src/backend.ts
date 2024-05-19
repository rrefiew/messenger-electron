// src/backend.js

import dotenv from "dotenv";
import { FieldPacket, QueryResult } from "mysql2";
import { Connection, createPool, Pool } from "mysql2/promise";
import express, { Express, Request, Response } from "express";
//var mysql = require("mysql2");

import * as Handlers from "./handlers/handlers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Make connection just for the db. Shoukd be changed later

var connection: Connection;

let db_config = {
  host: "nadya59k.beget.tech",
  user: "nadya59k_55",
  password: "nZU6%Dw4",
  database: "nadya59k_55",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
};

let pool: Pool = createPool(db_config);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the backend!");
});

// Does not use encrypted password and just encrypts the password itself
app.get(
  "/danger_zone/users/get_is_user_password_correct/id/:id/password/:password",
  async (req: Request, res: Response) => {
    try {
      const isCorrect: Boolean = await Handlers.GetIsUserPasswordCorrect(
        +req.params.id,
        req.params.password,
        pool
      );
      res.send(isCorrect);
    } catch (_e: any) {
      console.log(_e);
    }
  }
);

app.post(
  "/danger_zone/users/insert_new_user_into_database/",
  (req: Request, res: Response) => {
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
    Handlers.PostInsertNewUser(
      {
        name: UserData.username,
        password: UserData.password,
      },
      pool
    );
    res.status(201).send("User was created");
  }
);

app.get("/users/get_user_from_id/:id", async (req, res) => {
  let id: number = +req.params.id;
  // await pool.connect();
  const user = await Handlers.GetUserFromId(id, pool).catch((_e) =>
    console.log(_e)
  );
  res.send(user);
});

app.get("/users/get_user_id_from_name/:username", async (req, res) => {
  try {
    const id = await Handlers.GetUserIdFromName(req.params.username, pool);
    res.status(201).send(id.toString());
  } catch (_e: any) {
    res.status(501).send("Corresponding user was not found");
  }
});

app.listen(port, () => {
  //connection.connect();
  console.log(`Backend server listening at http://localhost:${port}`);
});
