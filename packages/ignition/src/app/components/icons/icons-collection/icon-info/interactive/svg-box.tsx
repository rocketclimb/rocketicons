import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { IconTree } from "rocketicons";
import { CollectionID } from "rocketicons/data";
import ActionButton from "@/components/action-button";

const DATA_APP = "./src/app/";
const DATA_DIR = `${DATA_APP}data-helpers/svgs/`;

type SvgBoxProps = {
  collectionId: CollectionID;
  iconId: string;
  copiedLabel: string;
};

const attrToString = (attr: { [key: string]: string }): string =>
  Object.entries(attr)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

const iconTreeToSvgString = ({ tag, attr, child }: IconTree, spacer: string = ""): string => {
  return (
    `${spacer}<${tag} ${attr ? attrToString(attr) : ""}` +
    (child.length
      ? ">\n" +
        child.map((c) => iconTreeToSvgString(c, `${spacer}  `)).join("\n") +
        `\n${spacer}</${tag}>`
      : "/>")
  );
};

const SvgBox = ({ copiedLabel, collectionId, iconId }: SvgBoxProps) => {
  const jsonUrl = resolve(DATA_DIR, collectionId, `${iconId}.json`);
  const { iconTree } = JSON.parse(readFileSync(jsonUrl, { encoding: "utf8", flag: "r" }));

  iconTree.attr.xmlns = "http://www.w3.org/2000/svg";
  const svg = iconTreeToSvgString(iconTree);

  return (
    <div className="flex content-box mt-2 md:mt-1 justify-between">
      <ActionButton copiedLabel={copiedLabel} clipboardText={svg} className="w-32">
        Copy SVG
      </ActionButton>
      <ActionButton download={{ data: svg, fileName: `${iconId}.svg` }} className="w-32">
        Download SVG
      </ActionButton>
    </div>
  );
};

export default SvgBox;
