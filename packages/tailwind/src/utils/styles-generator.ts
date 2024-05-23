import { Style, StyleHandler } from "@/types";
import { DEFAULT_CLASS_NAME, ROOT_CLASS_NAME, CLASS_NAME_SEPARATOR } from "./config-handler";
import sanitize from "./sanitize";

import { SpecialStyleProps, SpecialProps } from "./types";

abstract class StyleGenerator {
  protected classPrefix: string;

  protected defaultClassName: string;
  protected separator: string;

  constructor(classPrefix: string, defaultClassName: string, separator: string) {
    this.classPrefix = classPrefix;
    this.defaultClassName = defaultClassName;
    this.separator = separator;
  }

  protected extractClasses = (name: string) => {
    const [main, secondary] = name.split(this.separator);
    return [main, secondary ? `${this.classPrefix}-${secondary}` : ""];
  };

  abstract add(_name: string, _styles: string): void;
  abstract styles: Style;
}

class WebStyleGenerator extends StyleGenerator {
  protected rootClassName: string;
  parsed: Style = {};

  constructor(
    classPrefix: string,
    rootClassName: string,
    defaultClassName: string,
    separator: string
  ) {
    super(classPrefix, defaultClassName, separator);
    this.rootClassName = rootClassName;
  }

  add(name: string, styles: string): void {
    if (!styles) {
      return;
    }
    const [main, secondary] = this.extractClasses(name);
    const className = `${this.classPrefix}-${main}`;
    const selector =
      main === this.defaultClassName ? "" : `${this.classPrefix}-${this.rootClassName}`;
    const style = (this.parsed[className] ?? {}) as Style;
    if (secondary) {
      style[`&${selector}${secondary}`] = { [`@apply ${styles}`]: {} };
    } else if (selector) {
      style[`&${selector}`] = { [`@apply ${styles}`]: {} };
    } else {
      style[`@apply ${styles}`] = {};
    }
    this.parsed[className] = style;
  }

  get styles(): Style {
    return this.parsed;
  }
}

class StyleProps {
  private special: SpecialStyleProps = {
    w: "",
    h: "",
    size: "",
    stroke: "",
    fill: ""
  };

  private specialProps = Object.keys(this.special) as SpecialProps[];
  private props: Set<string> = new Set();

  constructor(...styles: string[]) {
    styles.forEach((style) => this.add(style));
  }

  add(style: string) {
    const [prop] = style.split("-") as SpecialProps[];
    if (this.specialProps.includes(prop)) {
      this.special[prop] = style;
      return;
    }
    this.props.add(style);
  }

  get syle(): string {
    return sanitize(`${[...this.props, ...Object.values(this.special)].join(" ")}`);
  }
}

class NativeStyleGenerator extends StyleGenerator {
  private parsed: Record<string, StyleProps> = {
    ".icon-outlined": new StyleProps("fill-none !important"),
    ".icon-filled": new StyleProps("stroke-none !important")
  };

  private getCurrentStyleFor(className: string): StyleProps {
    if (!this.parsed[className]) {
      this.parsed[className] = new StyleProps();
    }
    return this.parsed[className];
  }

  add(name: string, styles: string): void {
    const [main, secondary] = this.extractClasses(name);
    if (secondary.endsWith(this.defaultClassName)) {
      return;
    }
    const className = `${this.classPrefix}-${main}`;
    const handler = this.getCurrentStyleFor(className);
    styles.split(" ").forEach((style) => handler.add(style));
  }

  get styles(): Style {
    return Object.entries(this.parsed).reduce(
      (reduced, [key, value]) => ({
        ...reduced,
        [key]: { [`@apply ${value.syle}`]: {} }
      }),
      {}
    );
  }
}

export const stylesGenerator = (prefix: string, isNative: boolean = false) => {
  const classPrefix = `.${prefix}`;

  const generator = isNative
    ? new NativeStyleGenerator(classPrefix, DEFAULT_CLASS_NAME, CLASS_NAME_SEPARATOR)
    : new WebStyleGenerator(
        classPrefix,
        ROOT_CLASS_NAME,
        DEFAULT_CLASS_NAME,
        CLASS_NAME_SEPARATOR
      );

  const creator = (themes: StyleHandler[]) => {
    for (const option of themes) {
      generator.add(option.name(), option.styles());
    }
  };

  const add = (themes: StyleHandler[]) => {
    creator(themes);
    return {
      add,
      styles: () => generator.styles
    };
  };

  return {
    add
  };
};
