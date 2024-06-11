"use client";
import { DetailedHTMLProps, HTMLAttributes, forwardRef } from "react";
import { PropsWithChildrenAndClassName } from "@/types";

const Section = forwardRef<
  HTMLDivElement,
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
    PropsWithChildrenAndClassName
>(function Section({ className, children, ...props }, ref) {
  return (
    <section
      ref={ref}
      {...props}
      className={`mt-2.5 mb-3.5 px-2 thin w-full md:w-[450px] grow shrink-0 ${className ?? ""}`}
    >
      <div className="content-box pb-3 rounded border border-surface-border dark:border-surface-dark md:h-56">
        {children}
      </div>
    </section>
  );
});

export default Section;
