import DocLink from "./doc-link";
import Badge from "./badge";

// License type as string for this component
type LicenseType = string;

const shortForm: Record<string, string> = {
  MIT: "MIT",
  "MPL-2.0 license": "MPL",
  "CC BY 4.0 License": "CC BY",
  "CC BY 4.0": "CC BY",
  "Apache License Version 2.0": "ALv2",
  "Apache 2.0": "ALv2",
  "CC BY-SA 3.0": "CC BY-SA",
  "CC BY 3.0": "CC3.0",
  ISC: "ISC",
  "SIL OFL 1.1": "OFL",
  "CC0 1.0 Universal": "CC0"
};

type LicenseTagProps = {
  license: LicenseType;
};

const LicenseTag = ({ license }: LicenseTagProps) => (
  <Badge className="lg:hidden">{shortForm[license] || license}</Badge>
);

type LicenseProps = {
  license: LicenseType;
  url: string;
};

const License = ({ url, license }: LicenseProps) => (
  <DocLink href={url}>
    <span className="hidden md:ml-3 md:mt-2 lg:inline-block lg:m-0">{license}</span>
    <LicenseTag license={license} />
  </DocLink>
);

export default License;
