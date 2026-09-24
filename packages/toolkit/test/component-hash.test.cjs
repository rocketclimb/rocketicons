const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizedComponentHash } = require("../dist/component-hash");

test("component hashes ignore code formatting and quote style without changing source", () => {
  const original =
    'import { IconGenerator } from "../core";\nexport function Icon(){ return IconGenerator({"d":"M10 20"}, "outline", "icon")(); }\n';
  const formatted =
    "import{IconGenerator}from'../core';export function Icon() {return IconGenerator({ d: 'M10 20' },'outline','icon')()}";
  assert.equal(normalizedComponentHash(original), normalizedComponentHash(formatted));
  assert.match(original, /\n/);
});

test("component hashes retain SVG data, identifiers, and comments", () => {
  const original = 'return IconGenerator({d:"M10 20"}, "outline")();';
  const changedPath = 'return IconGenerator({d:"M1020"}, "outline")();';
  const changedName = 'return OtherGenerator({d:"M10 20"}, "outline")();';
  assert.notEqual(normalizedComponentHash(original), normalizedComponentHash(changedPath));
  assert.notEqual(normalizedComponentHash(original), normalizedComponentHash(changedName));
  assert.notEqual(
    normalizedComponentHash(original),
    normalizedComponentHash(`${original}\n// edited`)
  );
});

test("unsupported syntax fails closed and restricted newlines remain significant", () => {
  assert.equal(normalizedComponentHash("const icon = <svg />;"), null);
  assert.equal(normalizedComponentHash("const pattern = /a b/;"), null);
  assert.notEqual(
    normalizedComponentHash("return value;"),
    normalizedComponentHash("return\nvalue;")
  );
});
