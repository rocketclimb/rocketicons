export const printCmdRet = (ret) => {
  // Don't print these types
  if (typeof ret === "boolean" || !ret) return;

  if (typeof ret.stdout === "string") {
    process.stdout.write(ret.stdout);
  } else {
    process.stdout.write(ret);
  }
};
