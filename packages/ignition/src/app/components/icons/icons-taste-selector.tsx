"use client";
import { PropsWithChildren } from "react";
import { CollectionID } from "rocketicons/data";

import LiContainer from "./li-container";

import { useIconsTasteContext } from "./icon-taste-provider";

const IconsTasteSelector = ({
  id,
  children
}: {
  id: CollectionID;
} & PropsWithChildren) => {
  const { selected, select } = useIconsTasteContext();

  return (
    <>
      <LiContainer
        id={id}
        selected={selected}
        className="group/collapsed data-[selected=true]:hidden data-[selected=true]:xs:block"
      >
        <div
          onClick={() => selected !== id && select(id)}
          onKeyDown={({ key }) => key === "Enter" && selected !== id && select(id)}
          role="button"
          tabIndex={0}
          className="transition-all duration-200 group-data-[selected=false]/collapsed:hover:scale-[1.01] group-data-[selected=true]/collapsed:opacity-60"
        >
          {children}
        </div>
      </LiContainer>
    </>
  );
};

export default IconsTasteSelector;
