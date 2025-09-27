import { svgAsJson } from "@/utils/svg-as-json";
import { NextRequest, NextResponse } from "next/server";
import { CollectionID } from "rocketicons/data";

import { defaultIconTree, defaultVariant } from "@/config";
import { attrToString, tree2String } from "@rocketicons/utils";

export async function GET(
  _: NextRequest,
  { params: { params } }: { params: { params: string[] } }
) {
  try {
    const [collectionId, iconId] = params;

    const {
      iconTree: { attr, child }
    } = (await svgAsJson(collectionId as CollectionID, iconId)) || {
      iconTree: defaultIconTree
    };

    const svg = `<svg xmlns="http://www.w3.org/2000/svg"
        ${attrToString(attr)}
      >
        ${tree2String(child)}
      </svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000" // 1 year in seconds (maximum recommended)
      }
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
