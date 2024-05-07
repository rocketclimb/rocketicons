import * as changeCase from "change-case";
import { readFileSync } from "fs";
import { resolve } from "path";
import { ImageResponse } from "next/og";
import { Languages } from "@/types";
import { withLocale } from "@/locales";
import { CollectionID } from "rocketicons/data";
import { IconsManifest, collectionsCounts, total } from "@/data-helpers/icons/manifest";
import { IconTree } from "rocketicons";
import { BiCollection } from "rocketicons/bi";
import { TbIcons } from "rocketicons/tb";
import { BsCollection } from "rocketicons/bs";
import React from "react";
import { tree2Element } from "rocketicons/core/utils";

const numberFormatter = (lang: Languages, number: number) =>
  new Intl.NumberFormat(lang).format(number);

const selectRandomIcon = (): string[] => {
  const iconsArray: string[][] = [
    ["lu", "smile"],
    ["lu", "bird"],
    ["fa", "fly"],
    ["pi", "flying-saucer"],
    ["pi", "alien"]
  ];
  const randomIndex = Math.floor(Math.random() * iconsArray.length);

  return iconsArray[randomIndex];
};

const chooseIconByType = (lang: Languages, subheading?: string): string[] => {
  const { config } = withLocale(lang);
  const { icons } = config("opengraph");
  const { roadmap } = config("nav");

  if (subheading) {
    if (subheading.startsWith("/docs")) {
      return ["sl", "docs"];
    } else if (subheading.startsWith(icons)) {
      return ["fa", "icons"];
    } else if (subheading.startsWith(roadmap)) {
      return ["fa", "road"];
    } else {
      return selectRandomIcon();
    }
  } else {
    return ["rc", "rocket-icon"];
  }
};

const traverseSvgToSetFillOnChildren = (
  node: IconTree,
  iconFilename: string,
  iconVariant: string | undefined
) => {
  if (iconFilename === "rocket-icon" && node.tag === "path") {
    node.attr.stroke =
      iconVariant == "full" && node.attr.fill == "none" ? "currentColor" : "none";
  }

  if (node.child) {
    node.child.forEach((child) => {
      traverseSvgToSetFillOnChildren(child, iconFilename, iconVariant);
    });
  }
};

const selectIcon = (
  iconCollectionId: string | undefined,
  iconId: string | undefined,
  lang: Languages,
  subheading: string | undefined
): { iconName: string; iconJson: IconTree } => {
  let iconJson: IconTree | undefined = undefined;
  const hasCollection = !!iconCollectionId;
  const hasIcon = hasCollection && !!iconId;
  let iconName: string | undefined;
  let iconVariant: string | undefined;
  let isValidCollection = false;
  let isValidIcon = false;
  let selectedIconCollectionId: CollectionID | undefined;
  let iconFilename: string | undefined;

  if (hasCollection) {
    const collection = IconsManifest.find(({ id }) => id === iconCollectionId);
    isValidCollection = (iconCollectionId && collection !== undefined) || false;
    isValidCollection = collection !== undefined;
    selectedIconCollectionId = iconCollectionId as CollectionID;
    if (hasIcon) {
      iconName = iconId && changeCase.pascalCase(iconId);
      iconFilename = iconId.replace(`${iconCollectionId}-`, "");
    } else {
      const icon = collection?.icons[0] ?? "";
      iconFilename = changeCase.kebabCase(icon);

      isValidIcon = icon !== undefined;

      iconFilename = iconFilename.replace(`${iconCollectionId}-`, "");
    }
  } else {
    const chosenIcon = chooseIconByType(lang, subheading);
    selectedIconCollectionId = chosenIcon[0] as CollectionID;
    iconFilename = chosenIcon[1];
  }

  const iconUrl = resolve(
    "./src/app/data-helpers/svgs",
    `${selectedIconCollectionId}/${iconFilename}.json`
  );

  const loadedIcon = readFileSync(iconUrl, {
    encoding: "utf-8"
  });

  if (loadedIcon) {
    const json = JSON.parse(loadedIcon);
    iconVariant = json.variant;
    iconJson = json.iconTree;
  }

  traverseSvgToSetFillOnChildren(iconJson!, iconFilename, iconVariant);

  return { iconName: iconName!, iconJson: iconJson! };
};

const OpenGraph = async ({
  lang,
  subheading,
  iconCollectionId,
  iconCollectionCount,
  iconCollectionName,
  iconId,
  text,
  darkMode = true
}: {
  lang: Languages;
  subheading?: string;
  iconCollectionId?: CollectionID;
  iconCollectionCount?: number;
  iconCollectionName?: string;
  iconId?: string;
  text?: string;
  darkMode?: boolean;
}) => {
  const bigIconSize = 200;
  const smallIconSize = 28;
  const color = darkMode ? "#ddd" : "#444";
  const outerPaddingClass = "p-80px";
  const internalLeftMarginClass = "ml-20px";

  const textColor = color,
    iconColor = color;
  const textGradient = `linear-gradient(to bottom right, ${
    darkMode ? "#fff 20%, #0ea5e9 70%" : "#000000 20%, #0ea5e9 70%"
  })`;

  const opengraph = withLocale(lang).config("opengraph");

  const quicksandRegular = readFileSync(resolve("./public", "fonts", "Quicksand-Regular.ttf"));
  const interMedium = readFileSync(resolve("./public", "fonts", "Inter-Medium.ttf"));

  const logoImg = readFileSync(
    resolve(
      "./public",
      darkMode ? "logo-rocketicons-white-nobg-512.png" : "logo-rocketicons-black-nobg-512.png"
    ),
    { encoding: "base64" }
  );

  const { iconName, iconJson } = selectIcon(iconCollectionId, iconId, lang, subheading);

  const totalIconsCount = total;

  const brand = withLocale(lang).config("brand");

  const bgImg = readFileSync(
    resolve("./public", darkMode ? "img/og-hero-dark.jpg" : "img/og-hero-light.jpg"),
    { encoding: "base64" }
  );

  const mainDivStyle = {
    display: "flex",
    color: textColor,
    backgroundImage: `url("data:image/jpeg;base64,${bgImg}")`,
    backgroundSize: "1200px 630px"
  };

  const bigIconsStyle = {
    width: `${bigIconSize}px`,
    height: `${bigIconSize}px`,
    display: "flex",
    fill: iconColor,
    stroke: iconColor,
    color: iconColor,
    padding: "0px"
  };

  const smallIconStyle = {
    ...bigIconsStyle,
    width: `${smallIconSize}px`,
    height: `${smallIconSize}px`
  };

  const mainTextBasicStyle: React.CSSProperties = {
    background: textGradient,
    backgroundClip: "text",
    color: "transparent",
    fontFamily: "Quicksand, sans-serif"
  };

  const mainTextStyle: React.CSSProperties = {
    ...mainTextBasicStyle,
    textWrap: "balance"
  };

  const subHeadingStyle: React.CSSProperties = {
    textWrap: "balance"
  };

  const afterLogoTextStyle: React.CSSProperties = {
    ...mainTextBasicStyle
  };

  return new ImageResponse(
    (
      <div tw={`h-full w-full flex flex-col ${outerPaddingClass}`} style={mainDivStyle}>
        <div tw="flex flex-col">
          <div tw="flex flex-row">
            <div tw="text-left flex flex-col grow">
              <div tw="flex flex-row">
                <picture>
                  <img
                    src={`data:image/png;base64,${logoImg}`}
                    alt="rocketicons Logo"
                    tw="w-128 h-23"
                    width={128}
                    height={23}
                  />
                </picture>
                {iconCollectionId && (
                  <span tw="mt-1.3 text-7xl" style={afterLogoTextStyle}>
                    /{iconCollectionId}
                  </span>
                )}
              </div>
              {(iconCollectionName || subheading) && (
                <p tw={`text-7xl ${internalLeftMarginClass}`} style={subHeadingStyle}>
                  {iconName ?? subheading}
                </p>
              )}
            </div>
            {iconJson && (
              <div tw="flex">
                <svg {...iconJson.attr} style={bigIconsStyle}>
                  {tree2Element(iconJson.child)}
                </svg>
              </div>
            )}
          </div>
        </div>
        <div tw={`flex grow mt-10 ${internalLeftMarginClass}`}>
          <span
            tw="mb-7 text-4xl"
            style={iconCollectionName ? mainTextBasicStyle : mainTextStyle}
          >
            {iconCollectionName ?? text ?? brand["motto"]}
          </span>
        </div>
        <div tw="w-full flex flex-row text-2xl">
          {iconCollectionCount && (
            <div tw="flex flex-row grow">
              <BsCollection style={smallIconStyle} />
              <div tw="flex flex-col ml-3">
                <span>{numberFormatter(lang, iconCollectionCount)}</span>
                <span>{opengraph["int-this-collection"]}</span>
              </div>
            </div>
          )}
          <div tw="flex flex-row grow">
            <BiCollection style={smallIconStyle} />
            <div tw="flex flex-col ml-3">
              <span>{numberFormatter(lang, collectionsCounts.size)}</span>
              <span>{opengraph["collections"]}</span>
            </div>
          </div>
          <div tw="flex flex-row grow">
            <TbIcons style={smallIconStyle} />
            <div tw="flex flex-col ml-3">
              <span>{numberFormatter(lang, totalIconsCount)}</span>
              <span>{opengraph["icons"]}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interMedium,
          style: "normal"
        },
        {
          name: "Quicksand",
          data: quicksandRegular,
          style: "normal"
        }
      ]
    }
  );
};

export default OpenGraph;
