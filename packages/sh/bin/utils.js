export const versionBumper = (versionInfo, type) => {
  versionInfo[type]++;

  if (type === "major") {
    versionInfo.minor = 0;
    versionInfo.patch = 0;
  } else if (type === "minor") {
    versionInfo.patch = 0;
  }

  const { major, minor, patch } = versionInfo;
  return `v${major}.${minor}.${patch}`;
};

export const bumpVersion = (text, type) => {
  const [major, minor, patch] = text.split(".");
  return versionBumper({ major, minor, patch }, type);
};
