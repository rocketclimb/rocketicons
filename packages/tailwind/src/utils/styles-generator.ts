import { Style, StyleHandler } from "@/types";
import { DEFAULT_CLASS_NAME, ROOT_CLASS_NAME, CLASS_NAME_SEPARATOR } from "./config-handler";

const sanitize = (str: string): string => str.replace(/\s+/g, " ").trim();

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

    // Convert Tailwind utility strings (like 'w-5', 'fill-current') to native CSS manually
    // This avoids the OOM loop seen in Webpack + Tailwind CSS v4 when injecting 8,000+ @apply rules.
    const cssProps: Record<string, string> = {};
    const tokens = styles.split(" ").filter(Boolean);
    for (const token of tokens) {
      if (token.startsWith("w-")) {
        const val = token.replace("w-", "");
        cssProps.width =
          val.includes("px") || val.includes("rem") || val.includes("em") || val.includes("%")
            ? val.replace(/[[\]]/g, "") // remove arbitrary bracket notation e.g. [20px] -> 20px
            : `calc(var(--spacing) * ${val})`;
      } else if (token.startsWith("h-")) {
        const val = token.replace("h-", "");
        cssProps.height =
          val.includes("px") || val.includes("rem") || val.includes("em") || val.includes("%")
            ? val.replace(/[[\]]/g, "")
            : `calc(var(--spacing) * ${val})`;
      } else if (token.startsWith("fill-")) {
        const val = token.replace("fill-", "");
        cssProps.fill =
          val === "current" ? "currentColor" : val === "none" ? "none" : `var(--color-${val})`;
      } else if (token.startsWith("stroke-")) {
        const val = token.replace("stroke-", "");
        cssProps.stroke =
          val === "current" ? "currentColor" : val === "none" ? "none" : `var(--color-${val})`;
      } else if (token === "inline-block") {
        cssProps.display = "inline-block";
      } else if (token === "align-middle") {
        cssProps["vertical-align"] = "middle";
      } else if (token === "p-0") {
        cssProps.padding = "0px";
      }
    }

    const cssPropsCasted = cssProps as unknown as Record<string, object>;
    if (secondary) {
      style[`&${selector}${secondary}`] = cssPropsCasted;
    } else if (selector) {
      style[`&${selector}`] = cssPropsCasted;
    } else {
      Object.assign(style, cssProps);
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
