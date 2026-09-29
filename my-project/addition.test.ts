import { describe, it, expect } from "bun:test";
import addition from "./addition";

describe("addition function", () => {
  it("should return the sum of two numbers", () => {
    expect(addition(1, 2)).toBe(3);
  });
});
