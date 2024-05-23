import { describe, expect, test } from "@jest/globals";
import { nativeHandleClassName } from "./handle-class-name.native";

describe("handleClassName", () => {
  describe("filled", () => {
    test("Should return filled and default", () => {
      const className = nativeHandleClassName("filled", "");

      expect(className).toBe("icon-default icon-filled");
    });

    test("Should return filled and provided class", () => {
      const className = nativeHandleClassName("filled", "icon-xl");

      expect(className).toBe("icon-default icon-filled icon-xl");
    });

    test("Should return filled, default and provided class", () => {
      const className = nativeHandleClassName("filled", "border border-slate");

      expect(className).toBe("icon-default icon-filled border border-slate");
    });
  });

  describe("outline", () => {
    test("Should return outlined", () => {
      const className = nativeHandleClassName("outlined", "");

      expect(className).toBe("icon-default icon-outlined");
    });

    test("Should return outlined and provided class", () => {
      const className = nativeHandleClassName("outlined", "icon-xl");

      expect(className).toBe("icon-default icon-outlined icon-xl");
    });

    test("Should return outlined, default and provided class", () => {
      const className = nativeHandleClassName("outlined", "border border-slate");

      expect(className).toBe("icon-default icon-outlined border border-slate");
    });
  });

  describe("full", () => {
    test("Should return default", () => {
      const className = nativeHandleClassName("full", "");

      expect(className).toBe("icon-default");
    });

    test("Should return provided class", () => {
      const className = nativeHandleClassName("full", "icon-xl");

      expect(className).toBe("icon-default icon-xl");
    });

    test("Should return default and provided class", () => {
      const className = nativeHandleClassName("full", "border border-slate");

      expect(className).toBe("icon-default border border-slate");
    });
  });
});
