import { describe, expect, test } from "@jest/globals";

import { formatCopyrightYears } from "./footer-years";

describe("footer copyright years", () => {
  test("shows only the starting year during the first year", () => {
    expect(formatCopyrightYears(2024)).toBe("2024");
  });

  test("shows a range after the starting year", () => {
    expect(formatCopyrightYears(2026)).toBe("2024–2026");
  });
});
