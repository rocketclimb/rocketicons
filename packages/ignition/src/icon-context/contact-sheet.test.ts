import { describe, expect, test } from "@jest/globals";
import sharp from "sharp";
import { contactSheetGlyph } from "@rocketicons/utils";

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

const sheetPixels = async (glyphs: string[]) => {
  const width = glyphs.length * 240;
  const cells = glyphs
    .map(
      (glyph, index) =>
        `<g transform="translate(${index * 240} 0)"><rect width="240" height="150" fill="white"/>${glyph}</g>`
    )
    .join("");
  const { data, info } = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="150">${cells}</svg>`
    )
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgb = (x: number, y: number) => [
    ...data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 3)
  ];
  return { width: info.width, height: info.height, rgb };
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
    expect(glyph).toContain('viewBox="0 0 40 40"');
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

  test("renders icons with reused clip IDs independently in one sheet", async () => {
    const clipped = (id: string, shape: { tag: string; attr: Record<string, string> }) =>
      contactSheetGlyph({
        ...icon("filled", {
          tag: "svg",
          attr: { viewBox: "0 0 24 24" },
          child: [
            {
              tag: "defs",
              attr: {},
              child: [
                { tag: "clipPath", attr: { id: "clip0" }, child: [{ ...shape, child: [] }] }
              ]
            },
            {
              tag: "rect",
              attr: { width: "24", height: "24", clipPath: "url(#clip0)" },
              child: []
            }
          ]
        }),
        id
      });
    const sheet = await sheetPixels([
      clipped("circle-icon", { tag: "circle", attr: { cx: "12", cy: "12", r: "6" } }),
      clipped("half-icon", { tag: "rect", attr: { width: "12", height: "24" } })
    ]);
    expect([sheet.width, sheet.height]).toEqual([480, 150]);
    expect(sheet.rgb(120, 50)).toEqual([17, 24, 39]);
    expect(sheet.rgb(90, 20)).toEqual([255, 255, 255]);
    expect(sheet.rgb(340, 50)).toEqual([17, 24, 39]);
    expect(sheet.rgb(380, 50)).toEqual([255, 255, 255]);
  });

  test("preserves gradient colors and escapes attribute values", async () => {
    const tree = {
      tag: "svg",
      attr: { viewBox: "0 0 24 24", "aria-label": 'sun & moon "theme"' },
      child: [
        {
          tag: "defs",
          attr: {},
          child: [
            {
              tag: "linearGradient",
              attr: { id: "paint" },
              child: [
                { tag: "stop", attr: { offset: "0%", stopColor: "#ff0000" }, child: [] },
                { tag: "stop", attr: { offset: "100%", stopColor: "#0000ff" }, child: [] }
              ]
            }
          ]
        },
        { tag: "rect", attr: { width: "24", height: "24", fill: "url(#paint)" }, child: [] }
      ]
    };
    const before = JSON.stringify(tree);
    const glyph = contactSheetGlyph(icon("full", tree));
    expect(glyph).toContain('aria-label="sun &amp; moon &quot;theme&quot;"');
    expect(glyph).toContain('stop-color="#ff0000"');
    expect(glyph).toContain('fill="url(#test-icon-paint)"');
    expect(JSON.stringify(tree)).toBe(before);
    const sheet = await sheetPixels([glyph]);
    const left = sheet.rgb(85, 50);
    const right = sheet.rgb(155, 50);
    expect(left[0]).toBeGreaterThan(left[2]);
    expect(right[2]).toBeGreaterThan(right[0]);
  });
});
