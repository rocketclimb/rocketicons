"use client";
import { PropsWithChildren, useRef } from "react";
import { useBoxContext } from "./box";

type SizeSelectorProps = {
  size: string;
} & PropsWithChildren;

const SizeSelector = ({ size, children }: SizeSelectorProps) => {
  const { size: selectedSize, setSize, sizeBox, sections } = useBoxContext();
  const ref = useRef<HTMLDivElement>(null);
  sizeBox.set(size, ref);
  return (
    <div
      ref={ref}
      data-current={selectedSize === size}
      onClick={() => {
        sections.get("sizes")?.current?.scrollIntoView();
        setSize(size);
      }}
      className="size-16 border border-surface-border dark:border-surface-dark dark:bg-surface-dark rounded-lg flex justify-center items-center mb-1.5 data-[current=true]:ring-2 data-[current=true]:ring-offset-0 data-[current=true]:ring-secondary"
    >
      {children}
    </div>
  );
};

export default SizeSelector;
