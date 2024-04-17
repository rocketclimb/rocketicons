import { PropsWithChildren } from "react";
import { LuArrowDownRight } from "rocketicons/lu";

type Resizable = boolean | "x" | "y";

type GridContainerProps = {
  resizable?: Resizable;
  showResizableTip?: boolean;
} & PropsWithChildren;

type Resize = "resize" | "resize-x" | "resize-y";
type Resizing = `${Resize} relative min-w-80 mx-auto max-w-4xl`;

const getResizableUtility = (
  resizable?: Resizable
): Resizing | "resize-none" => {
  if (!resizable) {
    return "resize-none";
  }

  const resize: Resize = resizable === true ? "resize" : `resize-${resizable}`;
  return `${resize} relative min-w-80 mx-auto max-w-4xl`;
};

const GridContainer = ({
  children,
  resizable,
  showResizableTip,
}: GridContainerProps) => (
  <div
    className={`mt-4 mb-8 bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25 resize-x ${getResizableUtility(
      resizable
    )}`}
  >
    <div className="bg-grid">
      {children}
      {resizable && (
        <div
          data-show={showResizableTip}
          className="transition duration-200 absolute opacity-0 right-0 bottom-0 data-[show=true]:opacity-100"
        >
          <LuArrowDownRight className="icon-sky-base ml-3 mb-2 mr-1 animate-bounce" />
        </div>
      )}
    </div>
  </div>
);

export default GridContainer;
