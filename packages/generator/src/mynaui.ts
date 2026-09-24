import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import camelcase from "camelcase";
import { optimize } from "svgo";
import { glob } from "./glob";
import kebabCase from "./kebab-case";

type Style = "regular" | "solid";
type SourceFiles = Record<Style, string[]>;

const componentName = (file: string, style: Style) =>
  `My${style === "solid" ? "Solid" : ""}${camelcase(basename(file, ".svg"), {
    pascalCase: true
  })}`;

/** Validate the complete pinned SVG and tag boundary before generating either style. */
export const validateMynauiSources = async (
  { regular, solid }: SourceFiles,
  tags: Record<string, string[]>
) => {
  if (!regular.length || !solid.length)
    throw new Error("MynaUI needs nonempty regular and solid SVG sources");

  const components = new Set<string>();
  const ids = new Set<string>();
  const names: Record<Style, Set<string>> = { regular: new Set(), solid: new Set() };
  for (const [style, files] of Object.entries({ regular, solid }) as Array<[Style, string[]]>) {
    for (const file of files) {
      const filename = basename(file);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(filename))
        throw new Error(`Unexpected MynaUI SVG name: ${filename}`);
      const stem = basename(file, ".svg");
      names[style].add(stem);
      const component = componentName(file, style);
      const id = `my-${kebabCase(component.slice(2))}`;
      if (components.has(component) || ids.has(id))
        throw new Error(`Duplicate MynaUI component or ID: ${component} (${id})`);
      components.add(component);
      ids.add(id);

      const svg = await readFile(file, "utf8");
      try {
        optimize(svg, { plugins: [] }); // Parse without modifying geometry or stroke attributes.
      } catch (error) {
        throw new Error(`Malformed MynaUI SVG: ${filename}: ${String(error)}`);
      }
      if (!/<svg\b/.test(svg) || !/<path\b[^>]*\bd="[^"]+"/.test(svg))
        throw new Error(`Empty MynaUI SVG: ${filename}`);
      if (!/viewBox="0 0 24 24"/.test(svg))
        throw new Error(`Unexpected MynaUI viewBox: ${filename}`);
      if (style === "regular" && !/<svg\b[^>]*fill="none"[^>]*stroke="currentColor"/.test(svg))
        throw new Error(`Unexpected MynaUI regular stroke/fill: ${filename}`);
      if (style === "solid" && !/<svg\b[^>]*fill="currentColor"/.test(svg))
        throw new Error(`Unexpected MynaUI solid fill: ${filename}`);
    }
  }

  const regularNames = [...names.regular].sort();
  const solidNames = [...names.solid].sort();
  if (JSON.stringify(regularNames) !== JSON.stringify(solidNames))
    throw new Error("MynaUI regular and solid icon names differ");
  if (JSON.stringify(regularNames) !== JSON.stringify(Object.keys(tags).sort()))
    throw new Error("MynaUI tags.json does not cover exactly the imported icons");
  if (
    Object.values(tags).some(
      (terms) => !Array.isArray(terms) || terms.some((term) => typeof term !== "string")
    )
  )
    throw new Error("MynaUI tags.json contains invalid tags");
};

export const listMynauiSources = async (root: string): Promise<SourceFiles> => {
  const [regular, solid, rawTags] = await Promise.all([
    glob(join(root, "icons", "*.svg")),
    glob(join(root, "icons-solid", "*.svg")),
    readFile(join(root, "tags.json"), "utf8")
  ]);
  const files = { regular: regular.sort(), solid: solid.sort() };
  await validateMynauiSources(files, JSON.parse(rawTags) as Record<string, string[]>);
  return files;
};
