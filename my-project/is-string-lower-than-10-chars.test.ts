import { describe, it, expect } from "bun:test";
import isStringLowerThan10Chars from "./is-string-lower-than-10-chars";

describe("isStringLowerThan10Chars function", () => {
  it("should return true when the string is shorter than 10 characters", () => {
    expect(isStringLowerThan10Chars("hello")).toBe(true);
  });
});
