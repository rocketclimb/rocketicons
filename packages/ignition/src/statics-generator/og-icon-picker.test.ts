import { describe, expect, test } from "@jest/globals";

import { pickRepresentativeIcon } from "./og-icon-picker";

const icons = (...names: string[]) =>
  names.map((name) => ({ id: name.replace(/\s/g, "-"), name }));

describe("collection cover icon", () => {
  test("skips the alphabetical junk that used to front the card", () => {
    // Font Awesome 6's first icon is literally "0", which reads as a broken image.
    const picked = pickRepresentativeIcon("fa6", icons("0", "1", "500 px", "rocket", "zebra"));

    expect(picked?.name).toBe("rocket");
  });

  test("matches a concept by prefix, not just exactly", () => {
    // Remix names its icons "home fill" / "home line" — an exact match would miss them.
    const picked = pickRepresentativeIcon("ri", icons("24 hours fill", "home fill"));

    expect(picked?.name).toBe("home fill");
  });

  test("gives different collections different concepts", () => {
    // A fixed priority list would put the same rocket on 17 of 32 cards.
    const catalogue = icons("rocket", "home", "star", "cloud", "camera", "tag", "globe");
    const chosen = ["fa6", "wi", "lu", "md", "bs", "tb"].map(
      (id) => pickRepresentativeIcon(id, catalogue)?.name
    );

    expect(new Set(chosen).size).toBeGreaterThan(1);
  });

  test("is deterministic across builds", () => {
    const catalogue = icons("rocket", "home", "star", "cloud");

    expect(pickRepresentativeIcon("wi", catalogue)).toEqual(
      pickRepresentativeIcon("wi", catalogue)
    );
  });

  test("falls back to the first non-degenerate icon when no concept matches", () => {
    const picked = pickRepresentativeIcon("xx", icons("0", "ab", "abacus"));

    expect(picked?.name).toBe("abacus");
  });

  test("still returns something for a single-icon collection", () => {
    // rc ships exactly one icon.
    expect(pickRepresentativeIcon("rc", icons("rocket icon"))?.name).toBe("rocket icon");
    expect(pickRepresentativeIcon("empty", [])).toBeUndefined();
  });
});
