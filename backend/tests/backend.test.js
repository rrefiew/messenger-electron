import { expect, test } from "vitest";

function sum(a, b) {
  return a + b;
}

test("Add 1 + 2", () => {
  expect(sum(1, 2)).toBe(3);
});
