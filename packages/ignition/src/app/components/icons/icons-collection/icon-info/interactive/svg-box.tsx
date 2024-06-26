import { IconTree } from "rocketicons";
import { CollectionID } from "rocketicons/data";
import ActionButton from "@/components/action-button";
import { svgAsJson } from "@/utils/svg-as-json";

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

const SvgBox = async ({ copiedLabel, collectionId, iconId }: SvgBoxProps) => {
  const { iconTree } = await svgAsJson(collectionId, iconId);
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
