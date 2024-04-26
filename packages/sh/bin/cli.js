#!/usr/bin/env node
import minimist from "minimist";
import { rcsh } from "./rc-sh.js";
import { shouldReadStdin } from "./config.js";

const parsedArgs = minimist(process.argv.slice(2), {
  stopEarly: true,
  boolean: true
});

const run = (input) => {
  process.exitCode = rcsh.call(input, process.argv);
};
if (shouldReadStdin(parsedArgs._)) {
  console.log(parsedArgs);
  const chunks = [];
  process.stdin.on("data", (data) => chunks.push(data));
  process.stdin.on("end", () => run(chunks.join("")));
} else {
  run(null);
}
