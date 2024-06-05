import { describe, expect, test } from "@jest/globals";
import sanitize from "./sanitize";

describe("sanitize", () => {
  test("should remove spaces between from classes", () => {
    expect(sanitize("class1   class2")).toBe("class1 class2");
  });

  test("should remove spaces from begin", () => {
    expect(sanitize(" class1 class2")).toBe("class1 class2");
  });

  test("should remove spaces from end", () => {
    expect(sanitize("class1 class2 ")).toBe("class1 class2");
  });
});
