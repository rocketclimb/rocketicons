import { CollectionID, loader } from "rocketicons/data";

export const getIconsDataManifest = async (id: CollectionID) =>
  (await loader(id)).manifest;

export const getIconsData = async (id: CollectionID) => await loader(id);
