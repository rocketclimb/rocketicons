import { useState, useEffect } from "react";
import { IconType } from "rocketicons";
import { IconInfo } from "@rocketicons/core";
import { CollectionID, CollectionInfo } from "rocketicons/data";
import { getIconsData } from "./get-icons-data";

type ManifestHandler = Omit<CollectionInfo, "icons"> & {
  icons: CollectionHandler<IconInfo>;
};

const dataLoader = async (id: CollectionID) => {
  const { manifest, ...icons } = await getIconsData(id);
  const mapping = Object.entries(manifest.icons).reduce(
    (reduced, [key, { id }]) => ({ ...reduced, [id]: key }),
    {}
  );

  const handler: ManifestHandler = {
    ...manifest,
    icons: new CollectionHandler(manifest.icons, mapping),
  };

  return { manifest: handler, icons: new CollectionHandler(icons, mapping) };
};

class CollectionHandler<T> {
  public readonly length: number;
  constructor(
    private collection: Record<string, T>,
    private mapping: Record<string, string>
  ) {
    this.length = Object.keys(collection).length;
  }

  toArray(): [string, T][] {
    return Object.entries(this.collection);
  }

  getById(id: string): T {
    return this.collection[this.mapping[id]];
  }

  getByName(name: string): T {
    return this.collection[name];
  }
}

export const useIconsData = (
  id: CollectionID
): [CollectionHandler<IconType>, ManifestHandler, boolean] => {
  const [icons, setIcons] = useState<CollectionHandler<IconType>>(
    new CollectionHandler({}, {})
  );
  const [manifest, setManifest] = useState<ManifestHandler>({
    id: "" as CollectionID,
    name: "",
    projectUrl: "",
    license: "",
    licenseUrl: "",
    icons: new CollectionHandler({}, {}),
  });

  const init = async () => {
    const { manifest, icons } = await dataLoader(id);
    if (icons && manifest) {
      setIcons(icons);
      setManifest(manifest);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return [icons, manifest, !!manifest.id];
};
