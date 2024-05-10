const codeTypes = {
  "common-notation": "rc-cb-token-function",
  "tag-name": "rc-cb-token-token-keyword",
  "attr-name": "rc-cb-token-constant",
  "attr-value": "rc-cb-token-parameter",
  "common-text": "rc-cb-token-string"
};

const languages = {
  html: "language-html",
  js: "language-js",
  bash: "language-bash",
  json: "language-json"
};

type ValueOf<T> = T[keyof T];
export type Language = typeof languages;
export type Lang = keyof Language;
export type CodeTypes = typeof codeTypes;
export type CodeType = keyof CodeTypes;

export const getLanguageClass = (lang: Lang): ValueOf<Language> => languages[lang];
export const getCodeTypeClass = (codeType: CodeType): ValueOf<CodeTypes> => codeTypes[codeType];
