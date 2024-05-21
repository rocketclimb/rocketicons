import { describe, expect, test } from "@jest/globals";
import { StyleHandler } from "@/types";
import { stylesGenerator } from "./styles-generator";
import { CLASS_NAME_SEPARATOR } from "./config-handler";

const asStyle = (name: string, styles: string, variant: string = ""): StyleHandler => ({
  name: () => `${name}${variant && CLASS_NAME_SEPARATOR + variant}`,
  styles: () => styles
});

const asStyles = (name: string, styles: string, variant: string = ""): StyleHandler[] => [
  asStyle(name, styles, variant)
];

describe("stylesGenerator", () => {
  describe("styles", () => {
    describe("Web", () => {
      test("Should generate styles object", () => {
        const generator = stylesGenerator("icon");
        expect(
          generator
            .add(asStyles("default", "border w-1 h-1"))
            .add(asStyles("default", "stroke-primary", "outlined"))
            .add(asStyles("default", "fill-primary", "filled"))
            .add([
              asStyle("primary", "stroke-primary", "outlined"),
              asStyle("primary", "fill-primary", "filled"),
              asStyle("sm", "w-1 h-1"),
              asStyle("md", "w-2 h-2")
            ])
            .add([
              asStyle("primary-sm", "w-1 h-1"),
              asStyle("primary-sm", "stroke-primary", "outlined"),
              asStyle("primary-sm", "fill-primary", "filled"),
              asStyle("secondary-200-md", "w-2 h-2"),
              asStyle("secondary-200-md", "stroke-secondary-200", "outlined"),
              asStyle("secondary-200-md", "fill-secondary-200", "filled")
            ])
            .styles()
        ).toStrictEqual({
          ".icon-default": {
            "@apply border w-1 h-1": {},
            "&.icon-outlined": { "@apply stroke-primary": {} },
            "&.icon-filled": { "@apply fill-primary": {} }
          },
          ".icon-primary": {
            "&.icon-ri.icon-outlined": { "@apply stroke-primary": {} },
            "&.icon-ri.icon-filled": { "@apply fill-primary": {} }
          },
          ".icon-sm": {
            "&.icon-ri": { "@apply w-1 h-1": {} }
          },
          ".icon-md": {
            "&.icon-ri": { "@apply w-2 h-2": {} }
          },
          ".icon-primary-sm": {
            "&.icon-ri": { "@apply w-1 h-1": {} },
            "&.icon-ri.icon-outlined": { "@apply stroke-primary": {} },
            "&.icon-ri.icon-filled": { "@apply fill-primary": {} }
          },
          ".icon-secondary-200-md": {
            "&.icon-ri": { "@apply w-2 h-2": {} },
            "&.icon-ri.icon-outlined": { "@apply stroke-secondary-200": {} },
            "&.icon-ri.icon-filled": { "@apply fill-secondary-200": {} }
          }
        });
      });
      test("Should remove empty styles object", () => {
        const generator = stylesGenerator("icon");
        expect(
          generator.add(asStyles("default", "")).add(asStyles(`default`, "w-1 h-1")).styles()
        ).toStrictEqual({
          ".icon-default": {
            "@apply w-1 h-1": {}
          }
        });
      });
    });
    describe("Native", () => {
      test("Should generate styles object", () => {
        const generator = stylesGenerator("icon", true);
        expect(
          generator
            .add(asStyles("default", "border w-1 h-1"))
            .add(asStyles("default", "stroke-primary", "outlined"))
            .add(asStyles("default", "fill-primary", "filled"))
            .add([
              asStyle("primary", "stroke-primary", "outlined"),
              asStyle("primary", "fill-primary", "filled"),
              asStyle("sm", "w-1 h-1"),
              asStyle("md", "w-2 h-2")
            ])
            .add([
              asStyle("primary-sm", "w-1 h-1"),
              asStyle("primary-sm", "stroke-primary", "outlined"),
              asStyle("primary-sm", "fill-primary", "filled"),
              asStyle("secondary-200-md", "w-2 h-2"),
              asStyle("secondary-200-md", "stroke-secondary-200", "outlined"),
              asStyle("secondary-200-md", "fill-secondary-200", "filled")
            ])
            .styles()
        ).toStrictEqual({
          ".icon-outlined": {
            "@apply fill-none !important": {}
          },
          ".icon-filled": {
            "@apply stroke-none !important": {}
          },
          ".icon-default": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          },
          ".icon-primary": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          },
          ".icon-sm": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          },
          ".icon-md": {
            "@apply border w-2 h-2 stroke-primary fill-primary": {}
          },
          ".icon-primary-sm": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          },
          ".icon-secondary-200-md": {
            "@apply border w-2 h-2 stroke-secondary-200 fill-secondary-200": {}
          }
        });
      });
      test("Should remove empty styles object", () => {
        const generator = stylesGenerator("icon", true);
        expect(
          generator
            .add(asStyles("default", ""))
            .add(asStyles(`default`, "border w-1 h-1 stroke-primary fill-primary"))
            .styles()
        ).toStrictEqual({
          ".icon-outlined": {
            "@apply fill-none !important": {}
          },
          ".icon-filled": {
            "@apply stroke-none !important": {}
          },
          ".icon-default": {
            "@apply border w-1 h-1 stroke-primary fill-primary": {}
          }
        });
      });
    });
  });
});
