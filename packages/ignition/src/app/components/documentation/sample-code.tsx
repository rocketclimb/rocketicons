"use client";
import { CodeElementBlock, CodeStyler } from "@/components/code-block";

type SampleCodeProps = {
  icon: string;
  options: string[];
  className?: string;
};

const SampleCode = ({ icon, options, ...props }: SampleCodeProps) => (
  <CodeStyler className="text-sm" variant="minimalist">
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
