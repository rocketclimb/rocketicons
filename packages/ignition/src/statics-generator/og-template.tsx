import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";

import { tree2Element, type IconTree } from "@/components/icons/utils/tree-to-element";
import type { Languages } from "@/types";

export const OG_SIZE = { width: 1200, height: 630 };

const BIG_ICON_SIZE = 200;
const SMALL_ICON_SIZE = 28;
const OUTER_PADDING = 80;
const INTERNAL_LEFT_MARGIN = 20;

/**
 * The original sized the logo with `tw="w-128 h-23"`. Satori reads those as Tailwind spacing
 * units (x4px), so it rendered at 512x92 — the PNG's native width — and ignored the
 * `width={128} height={23}` attributes beside them. Porting those attributes literally shrank
 * the wordmark to a quarter of its size, which broke the `rocketicons/{collection}` lockup.
 * 512x94 is the file's native aspect.
 */
const LOGO_WIDTH = 512;
const LOGO_HEIGHT = 94;

const PUBLIC_ROOT = resolve("./public");

/** An icon ready to be drawn: the tree plus the variant that decides fill vs stroke. */
export type OgIconArt = { variant: string; iconTree: IconTree };

export type OgStatLabels = {
  collections: string;
  icons: string;
  inThisCollection: string;
};

export type OgTemplateProps = {
  lang: Languages;
  /** Large line under the logo — the page or doc title. */
  subheading?: string;
  collectionId?: string;
  collectionName?: string;
  collectionCount?: number;
  /** Drawn at 200px on the right. */
  icon?: OgIconArt;
  /** Mid-size line; falls back to the brand motto. */
  text?: string;
  totals: { totalCollections: number; totalIcons: number };
  labels: OgStatLabels;
  statIcons?: {
    inThisCollection?: OgIconArt;
    collections?: OgIconArt;
    icons?: OgIconArt;
  };
  darkMode?: boolean;
};

const readAsset = (...path: string[]) => readFileSync(resolve(PUBLIC_ROOT, ...path));

const memo = <T,>(load: () => T) => {
  let value: T | undefined;
  return () => (value ??= load());
};

/** Read once per process — the generator renders ~100 images from the same assets. */
const quicksand = memo(() => readAsset("fonts", "Quicksand-Regular.ttf"));
const inter = memo(() => readAsset("fonts", "Inter-Medium.ttf"));
const darkLogo = memo(() => readAsset("logo-rocketicons-white-nobg-512.png").toString("base64"));
const lightLogo = memo(() => readAsset("logo-rocketicons-black-nobg-512.png").toString("base64"));
const darkHero = memo(() => readAsset("img", "og-hero-dark.jpg").toString("base64"));
const lightHero = memo(() => readAsset("img", "og-hero-light.jpg").toString("base64"));

export const ogFonts = () => [
  { name: "Inter", data: inter(), style: "normal" as const, weight: 500 as const },
  { name: "Quicksand", data: quicksand(), style: "normal" as const, weight: 400 as const }
];

const numberFormatter = (lang: Languages, value: number) =>
  new Intl.NumberFormat(lang).format(value);

/**
 * The subheading slot is a single 1040px-wide line. Long doc titles overflow it at the
 * original 72px, so step the size down rather than let the layout spill off the canvas.
 */
const subheadingFontSize = (text: string) => {
  if (text.length <= 14) return 72;
  if (text.length <= 24) return 56;
  if (text.length <= 36) return 44;
  return 36;
};

const iconStyle = (art: OgIconArt, size: number, color: string): React.CSSProperties => ({
  width: `${size}px`,
  height: `${size}px`,
  display: "flex",
  padding: "0px",
  ...(["filled", "full"].includes(art.variant) && { fill: color }),
  ...(["outlined", "full"].includes(art.variant) && { stroke: color })
});

const Glyph = ({ art, size, color }: { art: OgIconArt; size: number; color: string }) => (
  <svg {...art.iconTree.attr} style={iconStyle(art, size, color)}>
    {tree2Element(art.iconTree.child)}
  </svg>
);

const Stat = ({
  art,
  color,
  value,
  label
}: {
  art?: OgIconArt;
  color: string;
  value: string;
  label: string;
}) => (
  <div style={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
    {art && <Glyph art={art} size={SMALL_ICON_SIZE} color={color} />}
    <div style={{ display: "flex", flexDirection: "column", marginLeft: 12 }}>
      <span>{value}</span>
      <span>{label}</span>
    </div>
  </div>
);

export const ogTemplate = ({
  lang,
  subheading,
  collectionId,
  collectionName,
  collectionCount,
  icon,
  text,
  totals,
  labels,
  statIcons = {},
  darkMode = true
}: OgTemplateProps): React.ReactElement => {
  const color = darkMode ? "#ddd" : "#444";
  const gradient = `linear-gradient(to bottom right, ${
    darkMode ? "#fff 20%, #0ea5e9 70%" : "#000000 20%, #0ea5e9 70%"
  })`;

  const gradientText: React.CSSProperties = {
    background: gradient,
    backgroundClip: "text",
    color: "transparent",
    fontFamily: "Quicksand, sans-serif"
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        padding: OUTER_PADDING,
        color,
        backgroundImage: `url("data:image/jpeg;base64,${darkMode ? darkHero() : lightHero()}")`,
        backgroundSize: `${OG_SIZE.width}px ${OG_SIZE.height}px`
      }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, textAlign: "left" }}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- satori renders this to
                a PNG at build time; next/image has no meaning outside the browser. */}
            <img
              src={`data:image/png;base64,${darkMode ? darkLogo() : lightLogo()}`}
              alt="rocketicons"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
            />
            {collectionId && (
              <span style={{ ...gradientText, fontSize: 72, lineHeight: 1, marginTop: 5 }}>
                /{collectionId}
              </span>
            )}
          </div>
          {subheading && (
            <p
              style={{
                fontSize: subheadingFontSize(subheading),
                lineHeight: 1.1,
                marginLeft: INTERNAL_LEFT_MARGIN,
                textWrap: "balance"
              }}
            >
              {subheading}
            </p>
          )}
        </div>
        {icon && (
          <div style={{ display: "flex" }}>
            <Glyph art={icon} size={BIG_ICON_SIZE} color={color} />
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          marginTop: 40,
          marginLeft: INTERNAL_LEFT_MARGIN
        }}
      >
        <span
          style={{
            ...gradientText,
            fontSize: 36,
            marginBottom: 28,
            ...(collectionName ? {} : { textWrap: "balance" })
          }}
        >
          {collectionName ?? text ?? ""}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "row", width: "100%", fontSize: 24 }}>
        {typeof collectionCount === "number" && (
          <Stat
            art={statIcons.inThisCollection}
            color={color}
            value={numberFormatter(lang, collectionCount)}
            label={labels.inThisCollection}
          />
        )}
        <Stat
          art={statIcons.collections}
          color={color}
          value={numberFormatter(lang, totals.totalCollections)}
          label={labels.collections}
        />
        <Stat
          art={statIcons.icons}
          color={color}
          value={numberFormatter(lang, totals.totalIcons)}
          label={labels.icons}
        />
      </div>
    </div>
  );
};
