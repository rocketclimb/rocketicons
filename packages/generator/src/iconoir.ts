import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import camelcase from "camelcase";
import { optimize } from "svgo";
import { glob } from "./glob";
import kebabCase from "./kebab-case";

type Style = "regular" | "solid";
type SourceFiles = Record<Style, string[]>;

const iconName = (file: string, style: Style) =>
  `Oir${style === "solid" ? "Solid" : ""}${camelcase(basename(file, ".svg"), { pascalCase: true })}`;

/** Reject source drift before generation, including names that collide across styles. */
export const validateIconoirSources = async ({ regular, solid }: SourceFiles) => {
  if (!regular.length || !solid.length)
    throw new Error("Iconoir needs nonempty regular and solid SVG sources");

  const components = new Set<string>();
  const ids = new Set<string>();
  for (const [style, files] of Object.entries({ regular, solid }) as Array<[Style, string[]]>) {
    for (const file of files) {
      const filename = basename(file);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(filename))
        throw new Error(`Unexpected Iconoir SVG name: ${filename}`);
      const component = iconName(file, style);
      const id = `oir-${kebabCase(component.slice(3))}`;
      if (components.has(component) || ids.has(id))
        throw new Error(`Duplicate Iconoir component or ID: ${component} (${id})`);
      components.add(component);
      ids.add(id);

      const svg = await readFile(file, "utf8");
      try {
        optimize(svg, { plugins: [] }); // Parse without altering Iconoir's geometry or colors.
      } catch (error) {
        throw new Error(`Malformed Iconoir SVG: ${filename}: ${String(error)}`);
      }
      if (
        !/<svg\b/.test(svg) ||
        !/<(?:path|circle|ellipse|rect|polygon|polyline|line)\b/.test(svg)
      )
        throw new Error(`Empty Iconoir SVG: ${filename}`);
    }
  }
};

export const listIconoirSources = async (root: string): Promise<SourceFiles> => {
  const [regular, solid] = await Promise.all(
    (["regular", "solid"] as const).map(async (style) =>
      (await glob(join(root, style, "*.svg"))).sort()
    )
  );
  const files = { regular, solid };
  await validateIconoirSources(files);
  return files;
};
