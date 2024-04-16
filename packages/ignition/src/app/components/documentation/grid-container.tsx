import { PropsWithChildren } from "react";

const GridContainer = ({ children }: PropsWithChildren) => (
  <div className="mt-4 mb-8 bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25">
    <div className="bg-grid">{children}</div>
  </div>
);

export default GridContainer;
