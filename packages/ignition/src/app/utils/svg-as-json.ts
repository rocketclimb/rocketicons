import { CollectionID } from "@/app/components/icons/types";

export const svgAsJson = async (collectionId: CollectionID, iconId: string) => {
  try {
    // Read from public JSON files instead of SQLite database
    const response = await fetch(`/icons/${collectionId}/${iconId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${collectionId}/${iconId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading icon ${collectionId}/${iconId}:`, error);
    // Return a fallback structure
    return {
      iconTree: {
        tag: "svg",
        attr: { viewBox: "0 0 24 24", fill: "currentColor" },
        child: []
      },
      variant: "outlined"
    };
  }
};
