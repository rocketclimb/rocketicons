import { readFileSync } from "fs";
import { resolve } from "path";
import { ImageResponse } from "next/og";
import { Languages } from "@/types";
import { serverEnv } from "@/env/server";
import { withLocale } from "@/locales";
import { FaFly, FaIcons, FaRoad } from "rocketicons/fa";
import { CollectionID, IconsManifest } from "rocketicons/data";
import { IconType } from "rocketicons";
import { BiCollection } from "rocketicons/bi";
import { TbIcons } from "rocketicons/tb";
import { RcRocketIcon } from "rocketicons/rc";
import { SlDocs } from "rocketicons/sl";
import { LuBird, LuSmile } from "rocketicons/lu";
import { PiAlien, PiFlyingSaucer } from "rocketicons/pi";
import { BsCollection } from "rocketicons/bs";

const numberFormatter = (lang: Languages, number: number) =>
  new Intl.NumberFormat(lang).format(number);

const selectRandomIcon = (
  style: React.CSSProperties | undefined,
  iconKey?: string
): IconType | undefined => {
  const iconsMap = new Map<string, any>([
    ["LuSmile", <LuSmile key={"lusmile"} style={style} />],
    ["LuBird", <LuBird key={"lubird"} style={style} />],
    ["FaFly", <FaFly key={"fafly"} style={style} />],
    ["PiFlyingSaucer", <PiFlyingSaucer key={"piflyingsaucer"} style={style} />],
    ["PiAlien", <PiAlien key={"pialien"} style={style} />]
  ]);

  if (iconKey && iconsMap.has(iconKey)) {
    return iconsMap.get(iconKey);
  }
  const iconsArray = Array.from(iconsMap.values());
  const randomIndex = Math.floor(Math.random() * iconsArray.length);

  return iconsArray[randomIndex];
};

export const RocketIconChooser = ({
  lang,
  subheading,
  style,
  iconKey,
  Icon
}: {
  lang: Languages;
  subheading?: string;
  style?: React.CSSProperties;
  iconKey?: string;
  Icon?: IconType;
}): any => {
  const { config } = withLocale(lang);
  const { icons } = config("opengraph");
  const { roadmap } = config("nav");

  if (Icon) {
    return <Icon style={style} />;
  } else if (subheading) {
    if (subheading.startsWith("/docs")) {
      return <SlDocs style={style} />;
    } else if (subheading.startsWith(icons)) {
      return <FaIcons style={style} />;
    } else if (subheading.startsWith(roadmap)) {
      return <FaRoad style={style} />;
    } else {
      return selectRandomIcon(style, iconKey);
    }
  } else {
    return <RcRocketIcon style={style} />;
  }
};

const OpenGraph = async ({
  lang,
  subheading,
  iconCollectionId,
  iconCollectionCount,
  iconCollectionName,
  iconName,
  text,
  darkMode = true,
  Icon
}: {
  lang: Languages;
  subheading?: string;
  iconCollectionId?: CollectionID;
  iconCollectionCount?: number;
  iconCollectionName?: string;
  iconName?: string;
  text?: string;
  darkMode?: boolean;
  Icon?: IconType;
}) => {
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

  const bigIconSize = 200;
  const smallIconSize = 28;
  const color = darkMode ? "#ddd" : "#444";
  const textColor = color,
    iconColor = color;
  const textGradient = `linear-gradient(to bottom right, ${
    darkMode ? "#fff 20%, #0ea5e9 70%" : "#000000 20%, #0ea5e9 70%"
  })`;

  const outerPaddingClass = "p-80px";
  const internalLeftMarginClass = "ml-20px";

  const groupedCollections: Map<string, number> = new Map();
  IconsManifest.forEach(({ id, icons }: { id: string; icons: any[] }) => {
    if (!groupedCollections.get(id)) {
      groupedCollections.set(id, 0);
    }
    groupedCollections.set(id, icons.length);
  });

  const totalIconsCount = Array.from(groupedCollections.values()).reduce(
    (acc, count) => acc + count,
    0
  );

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
    display: "block",
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
            <div tw="flex">
              <RocketIconChooser
                lang={lang}
                subheading={subheading}
                style={bigIconsStyle}
                Icon={Icon}
              />
            </div>
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
              <span>{numberFormatter(lang, groupedCollections.size)}</span>
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
