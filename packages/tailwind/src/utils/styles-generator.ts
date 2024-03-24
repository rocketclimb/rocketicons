import { StyleHandler, DEFAULT_CLASS_NAME } from "./config-handler";

export type Style = Record<string, Record<string, {}>>;

type Extensor = (classPrefix: string) => Generator;

type Generator = (className: string, styles: string) => Style;

const builder: Extensor =
  (classPrefix: string) =>
  (className: string, styles: string): Style => {
    className = `${classPrefix}-${className}`;
    return { [className]: { [`@apply ${styles}`]: {} } };
  };

export const stylesGenerator = () => {
  let parsedStyles = {} as Style;

  const classPrefix = ".icon";

  const generator = builder(classPrefix);

  const creator = (themes: StyleHandler[], prefix: string = "") => {
    for (const option of themes) {
      parsedStyles = {
        ...parsedStyles,
        ...generator(`${prefix}${option.name()}`, option.styles()),
      };
      creator(
        option?.options(),
        (option.name() !== DEFAULT_CLASS_NAME &&
          `${prefix}${option.name()}-`) ||
          ""
      );
    }
  };

  const add = (themes: StyleHandler[]) => {
    creator(themes);
    return { add, styles: () => parsedStyles };
  };

  return {
    add,
  };
};
