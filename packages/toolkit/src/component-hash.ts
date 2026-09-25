import { createHash } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

// Generated icon components contain JavaScript/TypeScript tokens and JSON-like icon data.
// This lexer ignores trivia only where it cannot change those tokens. Unknown syntax
// returns null, so an edited component is treated as customized rather than guessed at.
const identifier = /[A-Za-z_$]/;
const word = /[A-Za-z0-9_$]/;
const punctuation = /[{}[\](),;:.=+*?!&|%~-]/;
const operators = [
  "===",
  "!==",
  ">>>",
  "**=",
  "&&=",
  "||=",
  "??=",
  "==",
  "!=",
  "=>",
  "?.",
  "??",
  "&&",
  "||",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "**",
  "~=",
  "<<",
  ">>"
];
const restrictedNewline = new Set(["return", "throw", "break", "continue", "yield"]);

const quoted = (source: string, start: number): { value: string; end: number } | null => {
  const quote = source[start];
  let value = "";
  for (let i = start + 1; i < source.length; i++) {
    const char = source[i];
    if (char === quote) return { value, end: i + 1 };
    if (char === "\n" || char === "\r") return null;
    if (char !== "\\") {
      value += char;
      continue;
    }
    const next = source[++i];
    if (next === undefined) return null;
    const simple: Record<string, string> = {
      "0": "\0",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
      v: "\v"
    };
    if (next in simple) {
      value += simple[next];
      continue;
    }
    if (next === "\n") continue;
    if (next === "\r") {
      if (source[i + 1] === "\n") i++;
      continue;
    }
    if (next === "x" || next === "u") {
      const width = next === "x" ? 2 : 4;
      const digits = source.slice(i + 1, i + 1 + width);
      if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(digits)) return null;
      value += String.fromCharCode(parseInt(digits, 16));
      i += width;
      continue;
    }
    value += next;
  }
  return null;
};

export const normalizedComponentHash = (source: string): string | null => {
  const tokens: string[] = [];
  let lastCodeToken = "";
  let lineBreak = false;
  for (let i = 0; i < source.length; ) {
    const char = source[i];
    if (/\s/.test(char)) {
      if (char === "\n" || char === "\r") lineBreak = true;
      i++;
      continue;
    }
    if (lineBreak && restrictedNewline.has(lastCodeToken)) tokens.push("newline");
    lineBreak = false;
    if (source.startsWith("//", i)) {
      const end = source.indexOf("\n", i);
      const next = end < 0 ? source.length : end;
      tokens.push(`comment:${source.slice(i, next).trimEnd()}`);
      i = next;
      continue;
    }
    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      if (end < 0) return null;
      tokens.push(`comment:${source.slice(i, end + 2)}`);
      i = end + 2;
      continue;
    }
    if (char === '"' || char === "'") {
      const string = quoted(source, i);
      if (!string) return null;
      tokens.push(`string:${JSON.stringify(string.value)}`);
      lastCodeToken = "string";
      i = string.end;
      continue;
    }
    if (identifier.test(char)) {
      let end = i + 1;
      while (end < source.length && word.test(source[end])) end++;
      lastCodeToken = source.slice(i, end);
      tokens.push(`word:${lastCodeToken}`);
      i = end;
      continue;
    }
    if (/[0-9]/.test(char)) {
      let end = i + 1;
      while (end < source.length && /[0-9.eE]/.test(source[end])) end++;
      lastCodeToken = "number";
      tokens.push(`number:${source.slice(i, end)}`);
      i = end;
      continue;
    }
    if (!punctuation.test(char)) return null;
    const operator = operators.find((item) => source.startsWith(item, i));
    const token = operator ?? char;
    tokens.push(`punctuation:${token}`);
    lastCodeToken = token;
    i += token.length;
  }
  const canonical = tokens
    .filter(
      (token, index) =>
        token !== "punctuation:;" ||
        (tokens[index + 1] !== "punctuation:}" && index !== tokens.length - 1)
    )
    .map((token, index, all) => {
      if (all[index + 1] !== "punctuation::") return token;
      if (token.startsWith("word:")) return `key:${token.slice(5)}`;
      if (!token.startsWith("string:")) return token;
      const key = JSON.parse(token.slice(7)) as string;
      return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `key:${key}` : token;
    });
  return digest(JSON.stringify(canonical));
};
