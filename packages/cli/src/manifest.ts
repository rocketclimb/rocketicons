import { IconsManifestType } from "@rocketicons/utils";
import { IconsManifest, CollectionID, License } from "rocketicons/data";

export const showList = () => {
  for (const { id, name } of IconsManifest) {
    console.log(`  @${id}${" ".repeat(4 - id.length)}| ${name}`);
  }
};

export const getManifest = (packageName: string): IconsManifestType<CollectionID, License> => {
  if (!packageName.startsWith("@")) {
    console.error(`Package ${packageName} must start with '@'`);
    process.exit(1);
  }

  packageName = packageName.slice(1);
  const pkg = IconsManifest.find(({ id }) => id === packageName);
  if (!pkg) {
    console.error(`Package ${packageName} not found`);
    process.exit(1);
  }

  return pkg;
};

export const parsePackageName = (packageName: string) => {
  if (!packageName.startsWith("@")) {
    console.error(`Package ${packageName} must start with '@'`);
    process.exit(1);
  }

  if (!packageName.includes("/")) {
    console.error(`Package ${packageName} must be <package>/<icon>`);
    process.exit(1);
  }

  const [pkgName, iconName] = packageName.split("/");

  const pkg = getManifest(pkgName);

  const icon = pkg.icons.find((icon) => icon === iconName);

  if (!icon) {
    console.error(`Icon ${iconName} not found in package @${pkgName}`);
    process.exit(1);
  }

  return { name: pkgName.slice(1), icon: iconName };
};

export default getManifest;
