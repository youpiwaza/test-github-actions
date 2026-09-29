import { describe, it, expect } from "bun:test";
import multiplication from "./multiplication";

describe("multiplication function", () => {
  it("should return the product of two numbers", () => {
    expect(multiplication(3, 4)).toBe(12);
  });
});
