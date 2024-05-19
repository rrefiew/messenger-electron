import { Connection, FieldPacket, QueryResult } from "mysql2/promise";
var sha = require("sha.js");
const crypto = require("crypto");
import * as SharedTypes from "../../../shared_types/types";

import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function encrypt(password: string, salt: string): string[] {
  const combined: string = salt + password;
  // Hash the combined string
  const hash: string = sha("sha256").update(combined).digest("hex");
  return [hash, salt];
}

type ID = number;

export interface User {
  id?: ID;
  name: string;
  password?: string;
}

export class BackendError extends Error {
  http_error_code: number;

  constructor(httpErrorCode?: number, message?: string) {
    super(message); // Pass remaining arguments (including vendor specific ones) to parent constructor
    this.http_error_code = httpErrorCode || 500; // Default to 500 if not provided
  }
}

// TODO: remove anys
function convertDatabaseSelectResponseToJson(
  results: any,
  fields: FieldPacket[]
) {
  return results.map((row: any) => {
    // Convert each row to a JSON object
    let rowJson: any;
    fields.forEach((field) => {
      rowJson[field.name] = row[field.name];
    });
    return rowJson;
  });
}

export async function PostInsertNewUser(user: User, connection: Connection) {
  if (user.password === undefined) {
    return Promise.reject(new BackendError(501, "No password was specified"));
  }
  const [hash, salt] = encrypt(user.password, generateSalt());
  let [results] = await connection.query(
    `INSERT INTO users_data(username, password, salt) VALUES ('${user.name}', '${hash}', '${salt}')`
  );
}

export async function GetUserFromId(
  id: number,
  connection: Connection
): Promise<User> {
  let resultUser: User = { id: id, name: "" };
  try {
    let [results] = await connection.query(
      `SELECT username FROM users_data WHERE id = '${id}'`
    );

    resultUser = (results as any)[0] as User;
  } catch (_e: any) {
    // Actually add error logic in here
    return Promise.reject(new BackendError(501, _e.message));
  }

  return resultUser;
}

export async function GetDialogueMessages(
  sender_id: number,
  peer_id: number,
  n: number,
  connection: Connection
): Promise<SharedTypes.UserMessage[]> {
  try {
    // Might be a bug in here
    let [results]: any = await connection.query(
      `SELECT id, text, sender_id, peer_id FROM user_messages WHERE sender_id = ${sender_id} and peer_id = ${peer_id} ORDER BY sent_at ASC LIMIT ${n} `
    );

    return results;
  } catch (_e: any) {
    console.log(_e);
    return Promise.reject(new BackendError(501, _e.message));
  }
}

export async function PostSendMessage(
  sender_id: number,
  peer_id: number,
  text: string,
  connection: Connection
) {
  try {
    await connection.query(
      `INSERT INTO user_messages (text, attachment_id, sender_id, peer_id, sent_at) VALUES ("${text}", ${0}, ${sender_id}, ${peer_id}, "${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}")`
    );
  } catch (_e: any) {
    return Promise.reject(new BackendError(501, _e.message));
  }
}

export async function GetUserIdFromName(
  name: string,
  connection: Connection
): Promise<ID> {
  try {
    let [results] = await connection.query(
      `SELECT id FROM users_data WHERE username = '${name}'`
    );
    const user = (results as any)[0] as User;
    if (!user) {
      return Promise.reject(new BackendError(501, "User was not found"));
    }
    if (user.id === undefined) {
      return Promise.reject("User was not found");
    }
    return user.id;
  } catch (_e: any) {
    // Actually add error logic in here
    return Promise.reject(new BackendError(501, _e.message));
  }
}

export async function GetIsUserPasswordCorrect(
  userId: number,
  userPassword: string,
  connection: Connection
): Promise<boolean> {
  try {
    let [results]: any = await connection.query(
      `SELECT password, salt FROM users_data WHERE id = '${userId}'`
    );
    let result = results[0];
    return encrypt(userPassword, result.salt)[0] === result.password;
  } catch (_e: any) {
    return Promise.reject(new BackendError(501, _e.message));
  }
}
