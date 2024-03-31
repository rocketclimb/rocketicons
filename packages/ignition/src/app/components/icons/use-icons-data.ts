import { useState, useEffect } from "react";
import { IconType } from "rocketicons";
import { CollectionID, CollectionInfo } from "rocketicons/data";
import { getIconsData } from "./get-icons-data";

export const useIconsData = (
  id: CollectionID
): [[string, IconType][], CollectionInfo] => {
  const [icons, setIcons] = useState<[string, IconType][]>([]);
  const [manifest, setManifest] = useState<CollectionInfo>({
    id: "" as CollectionID,
    name: "",
    projectUrl: "",
    license: "",
    licenseUrl: "",
    icons: {},
  });

  const init = async () => {
    const { manifest, ...icons } = await getIconsData(id);
    if (icons && manifest) {
      setIcons(Object.entries(icons));
      setManifest(manifest);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return [icons, manifest];
};
