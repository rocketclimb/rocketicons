"use client";
import { PropsWithChildren } from "react";
import { CollectionID } from "rocketicons/data";
import { IoMdClose } from "rocketicons/io";
import Button from "@/components/button";

import LiContainer, { Title } from "./li-container";

import { useIconsTasteContext } from "./icon-taste-provider";

const IconsTasteSelected = ({
  id,
  name,
  children
}: {
  id: CollectionID;
  name: string;
} & PropsWithChildren) => {
  const { selected, unselect } = useIconsTasteContext();

  return (
    <>
      {selected === id && (
        <LiContainer
          id={id}
          selected={selected}
          className="group/expanded relative data-[selected=true]:col-span-1 data-[selected=true]:xs:col-span-2 data-[selected=true]:lg:col-span-3"
        >
          <Title name={name} />
          <Button
            onClick={() => unselect()}
            className="absolute top-1 right-2 w-8 h-8 items-center justify-center flex"
          >
            <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
          </Button>
          {children}
        </LiContainer>
      )}
    </>
  );
};

export default IconsTasteSelected;
