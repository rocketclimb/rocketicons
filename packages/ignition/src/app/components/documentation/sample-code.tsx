"use client";
import { Languages, PropsWithClassName } from "@/types";
import CodeElementBlock from "@/components/code-block/code-element-block";
import CodeStyler from "@/components/code-block/code-styler";

type SampleCodeProps = {
  locale: Languages;
  icon: string;
  options: string[];
} & PropsWithClassName;

const SampleCode = ({ icon, options, ...props }: SampleCodeProps) => (
  <CodeStyler className="text-xs md:text-sm" variant="minimalist">
    {options.map((className, i) => (
      <CodeElementBlock
        key={i}
        {...props}
        attrs={{ className }}
        component={icon}
      />
    ))}
  </CodeStyler>
);

export default SampleCode;
