"use client";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { CollectionID } from "rocketicons/data";

type Context = {
  selected: CollectionID | "";
  select: (id: CollectionID) => void;
  unselect: () => void;
};

const initialContext: Context = {
  selected: "",
  select: () => {},
  unselect: () => {}
};

const IconsTasteContext = createContext<Context>(initialContext);

export const useIconsTasteContext = () => useContext(IconsTasteContext);

const IconsTasteProvider = ({ children }: PropsWithChildren) => {
  const [selected, select] = useState<CollectionID | "">("");
  const unselect = () => select("");

  return (
    <IconsTasteContext.Provider value={{ selected, select, unselect }}>
      {children}
    </IconsTasteContext.Provider>
  );
};

export default IconsTasteProvider;
