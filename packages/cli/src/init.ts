import { dirname, join } from "path";
import { execSync } from "child_process";
import { config } from "./config";

import handleTsConfig from "./handle-ts-config";

const init = async () => {
  console.log("Initializing rocketicons...");

  await handleTsConfig();

  console.log("Installing dependencies...");

  try {
    execSync("npm i --save @rocketicons/utils @rocketicons/tailwind", { stdio: "ignore" });
    console.log("Successfully installed @rocketicons/utils and @rocketicons/tailwind");
  } catch (error) {
    console.error("Failed to install dependencies:", error);
    process.exit(1);
  }

  console.log("Creating folder");

  try {
    execSync(`npx @rocketclimb/sh mkdir -p ${config.riPath}/core`, { stdio: "inherit" });
    execSync(`npx @rocketclimb/sh mkdir -p ${config.riPath}/icons`, { stdio: "inherit" });
    console.log("Successfully created folders");
  } catch (error) {
    console.error("Failed to create folders:", error);
    process.exit(1);
  }

  console.log("Creating files...");

  const __dirname = dirname(__filename);

  const corePath = join(__dirname, "index.tsx");
  const coreNativePath = join(__dirname, "index.native.tsx");

  try {
    execSync(`npx @rocketclimb/sh cp ${corePath} ${config.riPath}/core/index.tsx`, {
      stdio: "inherit"
    });
    execSync(`npx @rocketclimb/sh cp ${coreNativePath} ${config.riPath}/core/index.native.tsx`, {
      stdio: "inherit"
    });
    console.log("Successfully created files");
  } catch (error) {
    console.error("Failed to create files:", error);
    process.exit(1);
  }
};

export default init;
