"use client";
import { useSelectedLayoutSegment } from "next/navigation";
const ContentKindMarker = () => {
  const segment = useSelectedLayoutSegment();
  return <div className={`${segment ? "content" : "landpage"}`}></div>;
};

export default ContentKindMarker;
