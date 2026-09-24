import sharp from "sharp";
import toolkit from "@rocketicons/toolkit";
import utils from "@rocketicons/utils/dist/contact-sheet.js";

const { iconSummary, localIconTree, requireIcon } = toolkit;
const { contactSheetGlyph, xml } = utils;

const CELL_WIDTH = 240;
const CELL_HEIGHT = 150;
const MAX_COLUMNS = 3;

export const compareIcons = async (iconIds: string[]) => {
  const icons = iconIds.map((id) => requireIcon(id));
  const summaries = icons.map(iconSummary);
  if (new Set(summaries.map(({ id }) => id)).size !== summaries.length)
    throw new Error("Use each icon only once in compare_icons; remove duplicate icon IDs");

  const columns = Math.min(icons.length, MAX_COLUMNS);
  const rows = Math.ceil(icons.length / columns);
  const width = columns * CELL_WIDTH;
  const height = rows * CELL_HEIGHT;
  const cells = icons
    .map((icon, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const glyph = contactSheetGlyph({
        id: `${icon.collection}-${icon.id}`,
        variant: icon.variant,
        iconTree: localIconTree(icon)
      });
      return `<g transform="translate(${column * CELL_WIDTH} ${row * CELL_HEIGHT})"><rect width="${CELL_WIDTH}" height="${CELL_HEIGHT}" fill="white" stroke="#d1d5db"/>${glyph}<text x="120" y="112" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#111827">${xml(icon.name.slice(0, 30))}</text><text x="120" y="132" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6b7280">${xml(summaries[index].id.slice(0, 36))}</text></g>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="white"/>${cells}</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return {
    png,
    metadata: {
      source: "local" as const,
      width,
      height,
      columns,
      rows,
      icons: summaries.map((icon, index) => ({
        ...icon,
        row: Math.floor(index / columns),
        column: index % columns
      }))
    }
  };
};
