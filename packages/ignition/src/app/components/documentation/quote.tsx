import { PropsWithChildren } from "react";

const Quote = ({ children }: PropsWithChildren) => (
  <div className="quote mt-4 mb-8 mx-6 bg-surface-lighter rounded-r-lg overflow-hidden border-l-4 border-secondary dark:bg-surface-dark/25">
    <div className="my-4 ml-9 mr-6">{children}</div>
  </div>
);

export default Quote;
