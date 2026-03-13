import { PropsWithChildrenAndClassName } from "@/types";
import { CollectionID } from "rocketicons/data";

import RocketiconsText from "@/components/rocketicons-text";

type TitleProps = {
  name: string;
};

export const Title = ({ name }: TitleProps) => (
  <h4 className="truncate text-base lg:text-xl text-on-surface dark:text-on-surface-dark">
    {(name === "rocketclimb" && <RocketiconsText />) || name}
  </h4>
);

type LiContainerProps = {
  id: CollectionID;
  selected: string;
} & PropsWithChildrenAndClassName;

export const LiContainer = ({ id, className, selected, children }: LiContainerProps) => {
  return (
    <li
      data-selected={id === selected ? "true" : "false"}
      className={`animate-pulse has-[li]:animate-none min-h-[80px] relative px-2 py-1 rounded-xl border border-surface-border-light dark:border-0 dark:ring-1 dark:ring-inset dark:ring-surface/10 dark:bg-surface-dark data-[selected=false]:cursor-pointer data-[selected=true]:ring-1 data-[selected=true]:ring-secondary-light data-[selected=true]:dark:ring-2 data-[selected=true]:dark:ring-secondary/20 ${
        className || ""
      }`}
    >
      {children}
    </li>
  );
};

export default LiContainer;
