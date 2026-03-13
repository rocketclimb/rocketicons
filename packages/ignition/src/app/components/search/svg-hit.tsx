"use client";
import { useState, useEffect } from "react";
import { IconFromData } from "@rocketicons/core";
import { fromSvg, Variants } from "@rocketicons/utils";
import { BiLoaderAlt } from "rocketicons/bi";

const SvgHit = ({ src, variant }: { src: string; variant: Variants }) => {
  const [svgContent, setSvgContent] = useState<string>("");

  const fetchSvg = async () => {
    try {
      const response = await fetch(src);
      const text = await response.text();
      setSvgContent(text);
    } catch (error) {
      console.error("Error fetching SVG:", error);
    }
  };

  useEffect(() => {
    fetchSvg();
  }, [src]);

  return (
    <>
      {(svgContent && (
        <IconFromData
          className="icon-secondary-xl group-hover/result:icon-white-xl mr-3"
          iconTree={fromSvg(svgContent)}
          variant={variant}
        />
      )) || <BiLoaderAlt className="animate-spin duration-1000 icon-secondary-xl mr-3" />}
    </>
  );
};

export default SvgHit;
