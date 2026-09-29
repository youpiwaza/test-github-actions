import { describe, it, expect } from "bun:test";
import isStringGreaterThan10Chars from "./is-string-greater-than-10-chars";

describe("isStringGreaterThan10Chars function", () => {
  it("should return true when the string is longer than 10 characters", () => {
    expect(isStringGreaterThan10Chars("hello world")).toBe(true);
  });
});
