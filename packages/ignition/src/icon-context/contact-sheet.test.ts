import { describe, expect, test } from "@jest/globals";
import sharp from "sharp";

import { contactSheetGlyph } from "./contact-sheet";
import type { ContextSourceIcon } from "./types";

const icon = (variant: string, iconTree: ContextSourceIcon["iconTree"]): ContextSourceIcon => ({
  id: "test-icon",
  name: "Test icon",
  component: "TestIcon",
  variant,
  iconTree
});

const pixel = async (glyph: string, x: number, y: number) => {
  const { data, info } = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150"><rect width="240" height="150" fill="white"/>${glyph}</svg>`
    )
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return [...data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 3)];
};

describe("icon context contact sheets", () => {
  test("renders outline strokes while preserving an unfilled interior and source viewBox", async () => {
    const glyph = contactSheetGlyph(
      icon("outlined", {
        tag: "svg",
        attr: {
          viewBox: "0 0 40 40",
          fill: "none",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        },
        child: [{ tag: "rect", attr: { x: "5", y: "5", width: "30", height: "30" } }]
      })
    );
    expect(glyph).toContain('stroke-linecap="round"');
    expect(glyph).toContain('stroke-linejoin="round"');
    expect(await pixel(glyph, 90, 50)).toEqual([17, 24, 39]);
    expect(await pixel(glyph, 120, 50)).toEqual([255, 255, 255]);
  });

  test("uses currentColor for filled shapes and preserves child colors", async () => {
    const glyph = contactSheetGlyph(
      icon("filled", {
        tag: "svg",
        attr: { viewBox: "0 0 20 20" },
        child: [
          { tag: "rect", attr: { width: "20", height: "20", fill: "currentColor" } },
          { tag: "rect", attr: { x: "5", y: "5", width: "10", height: "10", fill: "white" } }
        ]
      })
    );
    expect(await pixel(glyph, 85, 50)).toEqual([17, 24, 39]);
    expect(await pixel(glyph, 120, 50)).toEqual([255, 255, 255]);
  });

  test("isolates reused SVG definition IDs between icons", () => {
    const tree = {
      tag: "svg",
      attr: { viewBox: "0 0 24 24" },
      child: [
        { tag: "defs", child: [{ tag: "clipPath", attr: { id: "clip0" }, child: [] }] },
        { tag: "path", attr: { d: "M0 0h24v24z", clipPath: "url(#clip0)", fillRule: "evenodd" } }
      ]
    };
    const first = contactSheetGlyph(icon("filled", tree));
    const second = contactSheetGlyph({ ...icon("filled", tree), id: "other-icon" });
    expect(first).toContain('id="test-icon-clip0"');
    expect(first).toContain('clip-path="url(#test-icon-clip0)"');
    expect(first).toContain('fill-rule="evenodd"');
    expect(second).toContain('clip-path="url(#other-icon-clip0)"');
  });
});
