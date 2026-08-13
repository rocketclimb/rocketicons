#!/usr/bin/env node

import init from "./init";
import list from "./list";
import add from "./add";
import parseArgs from "./parse-args";

const { command, value } = parseArgs();
const main = async () => {
  switch (command) {
    case "init":
      init();
      break;
    case "list":
      list(value);
      break;
    case "add":
      await add(value);
      break;
    default:
      console.error(`Command ${command} not found`);
      process.exit(1);
  }
};

main();
