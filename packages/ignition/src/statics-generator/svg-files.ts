import { cpSync } from "node:fs";

const generator = () => {
  cpSync("../generator/svgs", "./src/app/data-helpers/svgs/", {
    recursive: true,
    force: true
  });
};

generator();
