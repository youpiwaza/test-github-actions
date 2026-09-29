import { describe, it, expect } from "bun:test";
import division from "./division";

describe("division function", () => {
  it("should return the quotient of two numbers", () => {
    expect(division(6, 2)).toBe(3);
  });
});
