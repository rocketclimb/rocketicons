import { PropsWithChildren } from "react";

const Description = ({ children }: PropsWithChildren) => (
  <div className="relative mb-4 mt-1 prose">{children}</div>
);

export default Description;
