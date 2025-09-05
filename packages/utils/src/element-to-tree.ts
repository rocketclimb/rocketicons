import camelcase from "camelcase";
import { Cheerio, load as cheerioLoad, Element as CheerioElement } from "cheerio";
import { IconTree } from "./types";

export const elementToTree = (
  svg: string,
  multiColor: boolean | undefined,
  colorProps?: Record<string, boolean>
) => {
  const $doc = cheerioLoad(svg, { xmlMode: true });
  const $svg = $doc("svg");

  colorProps = colorProps || {};

  // filter/convert attributes
  // 1. remove class attr
  // 2. convert to camelcase ex: fill-opacity => fillOpacity
  const attrConverter = (
    attribs: Record<string, string>,
    tagName: string,
    isChild: boolean = false
  ) =>
    attribs &&
    Object.keys(attribs)
      .filter(
        (name) =>
          ![
            "class",
            ...(tagName === "svg" ? ["xmlns", "xmlns:xlink", "xml:space", "width", "height"] : []) // if tagName is svg remove size attributes
          ].includes(name)
      )
      .reduce(
        (obj, name) => {
          const newName = name.startsWith("aria-") ? name : camelcase(name);
          switch (newName) {
            case "fill":
            case "stroke":
              if (attribs[name] === "none" || attribs[name] === "currentColor" || multiColor) {
                if (!isChild || attribs[name] !== "currentColor") obj[newName] = attribs[name];
              }
              colorProps[name] = attribs[name] !== "none" ? true : colorProps[name];
              break;
            case "pId":
              break;
            case "dataName":
              break;
            case "style":
              break;
            default:
              obj[newName] = attribs[name];
              if (!colorProps["stroke"] && newName.match(/^stroke/)) {
                colorProps["stroke"] = true;
              }
              break;
          }
          return obj;
        },
        {} as Record<string, string>
      );

  // convert to [ { tag: 'path', attr: { d: 'M436 160c6.6 ...', ... }, child: { ... } } ]
  const convertElementToTree = (
    element: Cheerio<CheerioElement>,
    isChild: boolean = false
  ): IconTree[] =>
    element
      // ignore style, title tag
      .filter((_, e) => !!(e.tagName && !["style", "title"].includes(e.tagName)))
      // convert to AST recursively
      .map((_, e) => ({
        tag: e.tagName,
        attr: attrConverter(e.attribs, e.tagName, isChild),
        child: e?.children.length
          ? convertElementToTree($doc(e.children) as Cheerio<CheerioElement>, true)
          : []
      }))
      .get();

  return convertElementToTree($svg);
};
