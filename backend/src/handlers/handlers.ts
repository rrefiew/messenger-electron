import { Connection, FieldPacket } from "mysql2";

export interface User {
  id: number;
  name: string;
  password?: string;
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

  connection.query(
    `SELECT username FROM users_data WHERE id = '${id}'`,
    (error, results, fields) => {
      if (error) throw error;
      resultUser = convertDatabaseSelectResponseToJson(results, fields);
    }
  );

  return resultUser;
}
