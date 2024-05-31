"use client";
import { useState, createContext, useContext, PropsWithChildren, RefObject } from "react";

type BoxState = {
  size: string;
  setSize: (size: string) => void;
  color: string;
  setColor: (size: string) => void;
  stroke: string;
  setStroke: (size: string) => void;
  animation: string;
  setAnimation: (size: string) => void;
  isDirty: boolean;
  reset: () => void;
  sizeBox: Map<string, RefObject<HTMLDivElement>>;
  sections: Map<string, RefObject<HTMLDivElement>>;
};

const Context = createContext<BoxState>({
  size: "",
  setSize: () => {},
  color: "",
  setColor: () => {},
  stroke: "",
  setStroke: () => {},
  animation: "",
  setAnimation: () => {},
  isDirty: false,
  reset: () => {},
  sizeBox: new Map(),
  sections: new Map()
});

export const useBoxContext = () => useContext(Context);

const Box = ({ children }: PropsWithChildren) => {
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [stroke, setStroke] = useState<string>("");
  const [animation, setAnimation] = useState<string>("");
  const [sizeBox] = useState<Map<string, RefObject<HTMLDivElement>>>(new Map());
  const [sections] = useState<Map<string, RefObject<HTMLDivElement>>>(new Map());

  const reset = () => {
    setSize("");
    setColor("");
    setStroke("");
    setAnimation("");
  };

  return (
    <Context.Provider
      value={{
        size,
        setSize,
        color,
        setColor,
        stroke,
        setStroke,
        animation,
        setAnimation,
        isDirty: !!(size || color || stroke || animation),
        reset,
        sizeBox,
        sections
      }}
    >
      <div
        data-color={color.replace("icon-", "")}
        data-stroke={stroke}
        data-animation={animation}
        className="group/icon-panel panel relative opacity-0 group-data-[open=true]/info:opacity-100 group-data-[open=true]/info:animate-delayed-appearing h-full group-data-[open=true]/info:md:border-t group-data-[open=true]/info:lg:border-x group-data-[open=true]/info:rounded-t-lg group-data-[open=true]/info:lg:pr-1 group-data-[open=true]/info:lg:pb-1  group-data-[open=true]/info:md:border-surface-border group-data-[open=true]/info:md:dark:border-surface-medium group-data-[open=true]/info:bg-background group-data-[open=true]/info:dark:bg-background-dark"
      >
        {children}
      </div>
    </Context.Provider>
  );
};

export default Box;
