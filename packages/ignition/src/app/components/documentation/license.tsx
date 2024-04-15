import { License as LicenseType } from "rocketicons/data";
import DocLink from "./doc-link";

const shortForm: Record<LicenseType, string> = {
  MIT: "MIT",
  "MPL-2.0 license": "MPL",
  "CC BY 4.0 License": "CC BY",
  "CC BY 4.0": "CC BY",
  "Apache License Version 2.0": "ALv2",
  "CC BY-SA 3.0": "CC BY-SA",
  "CC BY 3.0": "CC3.0",
  ISC: "ISC",
  "SIL OFL 1.1": "OFL",
  "CC0 1.0 Universal": "CC0",
};

type LicenseTagProps = {
  license: LicenseType;
};
const LicenseTag = ({ license }: LicenseTagProps) => (
  <span className="md:hidden ml-3 text-xs leading-5 font-medium text-sky-600 dark:text-sky-400 bg-sky-400/10 rounded-full py-1 px-3 items-center hover:bg-sky-400/20">
    {shortForm[license]}
  </span>
);

type LicenseProps = {
  license: LicenseType;
  url: string;
};
const License = ({ url, license }: LicenseProps) => (
  <DocLink href={url}>
    <span className="hidden md:ml-3 md:mt-2 md:inline-block lg:m-0">
      {license}
    </span>
    <LicenseTag license={license} />
  </DocLink>
);

export default License;