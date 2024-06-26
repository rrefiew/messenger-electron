import {
  expect,
  test,
  vi,
  mock,
  it,
  describe,
  afterEach,
  beforeEach,
  beforeAll,
} from "vitest";
import mysql from "mysql2/promise";
import * as Handlers from "../src/handlers/handlers";
import { Connection, mysql } from "mysql2";

function sum(a, b) {
  return a + b;
}

vi.mock("mysql2", () => {
  const mysql = vi.fn();
  mysql.prototype.createConnection = vi.fn();
  mysql.prototype.query = vi.fn();
  return { mysql };
});

describe("Getting user info by id", () => {
  beforeAll(() => {
    mysql = new mysql();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get user by id", async () => {
    mysql.query.mockResolvedValueOnce([[{ id: 0, name: "Test Name" }]]);
    let user = await Handlers.GetUserFromId(0, mysql);

    expect(mysql.createConnection).toBeCalledTimes(0);
    expect(mysql.query).toBeCalledTimes(1);
    expect(user).toStrictEqual({ id: 0, name: "Test Name" });
  });

  it("should actually throw an error!", async () => {
    const mError = new Error("Unable to retrieve rows");
    mysql.query.mockRejectedValueOnce(mError);

    expect(async () => {
      await Handlers.GetUserFromId(0, mysql);
    }).rejects.toThrowError("Unable");

    expect(mysql.createConnection).toBeCalledTimes(0);
    expect(mysql.query).toBeCalledTimes(1);
  });
});

test("Add 1 + 2", () => {
  expect(sum(1, 2)).toBe(3);
});
