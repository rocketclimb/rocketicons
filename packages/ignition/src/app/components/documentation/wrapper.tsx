import { PropsWithChildrenAndClassName } from "@/types";

const Wrapper = ({ className, children }: PropsWithChildrenAndClassName) => (
  <div className={`mt-12 ${className ?? ""}`}>{children}</div>
);

export default Wrapper;
