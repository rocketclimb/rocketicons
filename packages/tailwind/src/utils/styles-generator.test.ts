import { describe, expect, test } from "@jest/globals";
import { stylesGenerator } from "./styles-generator";
import { StyleHandler } from "@/types";

const asStyle = (
  variant: string,
  name: string,
  styles: string,
  options: StyleHandler[]
): StyleHandler => ({
  variant: () => variant,
  name: () => name,
  styles: () => styles,
  options: () => options
});

describe("stylesGenerator", () => {
  describe("styles", () => {
    test("Should generate styles object", () => {
      const generator = stylesGenerator();
      expect(
        generator
          .add([
            asStyle("filled", "default", "border", [
              asStyle("filled", "primary", "text-blue", [asStyle("filled", "sm", "text-sm", [])])
            ])
          ])
          .styles()
      ).toStrictEqual({
        ".icon-default": { "@apply border": {} },
        ".icon-primary": { "@apply text-blue": {} },
        ".icon-primary-sm": { "@apply text-sm": {} }
      });
    });
  });
});
