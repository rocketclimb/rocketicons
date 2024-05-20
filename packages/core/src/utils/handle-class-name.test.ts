import { describe, expect, test } from "@jest/globals";
import { handleClassName } from "./handle-class-name";

describe("handleClassName", () => {
  describe("filled", () => {
    test("Should return filled and default", () => {
      const className = handleClassName("filled", "");

      expect(className).toBe("icon-default icon-filled");
    });

    test("Should return filled and provided class", () => {
      const className = handleClassName("filled", "icon-xl");

      expect(className).toBe("icon-default icon-filled icon-xl");
    });

    test("Should return filled, default and provided class", () => {
      const className = handleClassName("filled", "border border-slate");

      expect(className).toBe("icon-default icon-filled border border-slate");
    });
  });

  describe("outline", () => {
    test("Should return outlined", () => {
      const className = handleClassName("outlined", "");

      expect(className).toBe("icon-default icon-outlined");
    });

    test("Should return outlined and provided class", () => {
      const className = handleClassName("outlined", "icon-xl");

      expect(className).toBe("icon-default icon-outlined icon-xl");
    });

    test("Should return outlined, default and provided class", () => {
      const className = handleClassName("outlined", "border border-slate");

      expect(className).toBe("icon-default icon-outlined border border-slate");
    });
  });

  describe("full", () => {
    test("Should return default", () => {
      const className = handleClassName("full", "");

      expect(className).toBe("icon-default icon-filled icon-outlined");
    });

    test("Should return provided class", () => {
      const className = handleClassName("full", "icon-xl");

      expect(className).toBe("icon-default icon-filled icon-outlined icon-xl");
    });

    test("Should return default and provided class", () => {
      const className = handleClassName("full", "border border-slate");

      expect(className).toBe("icon-default icon-filled icon-outlined border border-slate");
    });
  });
});
