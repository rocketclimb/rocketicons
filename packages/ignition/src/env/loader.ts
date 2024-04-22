import fs from "node:fs";
const content = fs.readFileSync(".env", { encoding: "utf8", flag: "r" });
content.split(/\r?\n/).forEach((line) => {
  const [key, value] = line.trim().split("=");
  process.env[key] = value;
});
