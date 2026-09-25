import { describe, expect, test } from "@jest/globals";
import { renderIconSvg } from "./contact-sheet";
import type { IconTree } from "./types";

describe("renderIconSvg", () => {
  test("preserves SVG case-sensitive attributes and converts React-style attributes", () => {
    const tree: IconTree = {
      tag: "svg",
      attr: { viewBox: "0 0 32 32", baseProfile: "tiny", dataSlot: "icon" },
      child: [
        {
          tag: "linearGradient",
          attr: { id: "paint", gradientUnits: "userSpaceOnUse" },
          child: []
        },
        {
          tag: "path",
          attr: {
            d: 'M0 0 L32 32 & "test"',
            strokeWidth: "2",
            strokeMiterlimit: "4",
            fill: "url(#paint)"
          },
          child: []
        }
      ]
    };
    const original = JSON.stringify(tree);
    const svg = renderIconSvg(tree);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 32 32"');
    expect(svg).toContain('baseProfile="tiny"');
    expect(svg).toContain('gradientUnits="userSpaceOnUse"');
    expect(svg).toContain('data-slot="icon"');
    expect(svg).toContain('stroke-width="2"');
    expect(svg).toContain('stroke-miterlimit="4"');
    expect(svg).toContain('d="M0 0 L32 32 &amp; &quot;test&quot;"');
    expect(svg).toContain('fill="url(#paint)"');
    expect(JSON.stringify(tree)).toBe(original);
  });

  test("rejects a non-SVG root", () => {
    expect(() => renderIconSvg({ tag: "path", attr: {}, child: [] })).toThrow(/svg element/);
  });
});
