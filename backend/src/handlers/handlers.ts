import { Connection, FieldPacket, QueryResult } from "mysql2/promise";
import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";

export interface User {
  id: number;
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
