import plugin from "tailwindcss/plugin";

const codeBlockPlugin = plugin(({ addComponents }) => {
  addComponents({
    ".code-styler code": {
      "@apply font-normal": {}
    },
    ".language-html": {
      "& .rc-cb-token-function": {
        "@apply text-slate-100": {}
      },
      "& .rc-cb-token-token-keyword": {
        "@apply text-pink-400": {}
      },
      "& .rc-cb-token-constant": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-parameter": {
        "@apply text-sky-300": {}
      },
      "& .rc-cb-token-string": {
        "@apply text-slate-100": {}
      }
    },
    ".language-bash": {
      "& .line:has(span)": {
        "@apply before:content-['>'] before:text-pink-400 before:font-medium before:mr-3 last:before:hidden":
          {}
      },
      "& .rc-cb-token-function": {
        "@apply text-slate-50": {}
      },
      "& .rc-cb-token-token-keyword": {
        "@apply text-pink-400": {}
      },
      "& .rc-cb-token-constant": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-parameter": {
        "@apply text-sky-300": {}
      },
      "& .rc-cb-token-string": {
        "@apply text-slate-50": {}
      }
    },
    ".language-js": {
      "& .rc-cb-token-function": {
        "@apply text-slate-50": {}
      },
      "& .rc-cb-token-comment": {
        "@apply text-slate-300 font-light italic": {}
      },
      "& .rc-cb-foreground": {
        "@apply text-sky-300": {}
      },
      "& .rc-cb-token-keyword:only-child": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-keyword": {
        "@apply text-pink-400": {}
      },
      "& .rc-cb-token-string-expression": {
        "@apply text-sky-300": {}
      },
      "& .rc-cb-token-constant": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-punctuation": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-string": {
        "@apply text-slate-50": {}
      }
    },
    ".language-json": {
      "& .rc-cb-token-function": {
        "@apply text-slate-50": {}
      },
      "& .rc-cb-foreground, & .rc-cb-token-keyword": {
        "@apply text-slate-400 first:text-sky-300": {}
      },
      "& .rc-cb-token-string-expression": {
        "@apply text-sky-300": {}
      },
      "& .rc-cb-token-constant": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-punctuation": {
        "@apply text-slate-300": {}
      },
      "& .rc-cb-token-string": {
        "@apply text-slate-50": {}
      }
    }
  });
});

export default codeBlockPlugin;
