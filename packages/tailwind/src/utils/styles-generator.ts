import { DEFAULT_CLASS_NAME, CLASS_NAME_SEPARATOR } from "./config-handler";

import { Extensor, Style, StyleHandler } from "@/types";

export const stylesGenerator = (prefix: string) => {
  const classPrefix = `.${prefix}`;
  prefix = `${prefix}-`;

  const parsedStyles: Style = {};

  const extractClasses = (name: string) => {
    const [main, secondary] = name.split(CLASS_NAME_SEPARATOR);
    return [main, secondary ? `${classPrefix}-${secondary}` : ""];
  };

  const builder: Extensor = (classPrefix: string) => (name: string, styles: string) => {
    if (!styles) {
      return;
    }
    const [main, secondary] = extractClasses(name);
    const className = `${classPrefix}-${main}`;
    const selector = `${main === DEFAULT_CLASS_NAME ? "" : `${classPrefix}-${DEFAULT_CLASS_NAME}`}`;
    const style = (parsedStyles[className] ?? {}) as Style;
    if (secondary) {
      style[`&${selector}${secondary}`] = { [`@apply ${styles}`]: {} };
    } else if (selector) {
      style[`&${selector}`] = { [`@apply ${styles}`]: {} };
    } else {
      style[`@apply ${styles}`] = {};
    }
    parsedStyles[className] = style;
  };

  const generator = builder(classPrefix);

  const creator = (themes: StyleHandler[]) => {
    for (const option of themes) {
      generator(option.name(), option.styles());
    }
  };

  const add = (themes: StyleHandler[]) => {
    creator(themes);
    return {
      add,
      styles: () => parsedStyles
    };
  };

  return {
    add
  };
};
