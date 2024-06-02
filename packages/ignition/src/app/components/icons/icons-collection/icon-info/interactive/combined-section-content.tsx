"use client";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import { Tab, CodeElementOptionsStyler, CodeElementTabs } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";
import { useBoxContext } from "./box";

const combined = [
  "icon-yellow-2xl",
  "icon-yellow icon-2xl",
  "icon-purple-600-sm",
  "icon-purple-600 icon-sm"
];

const data = {
  "icon-yellow-2xl": { color: "icon-yellow", size: "icon-2xl" },
  "icon-yellow icon-2xl": { color: "icon-yellow", size: "icon-2xl" },
  "icon-purple-600-sm": { color: "icon-purple-600", size: "icon-sm" },
  "icon-purple-600 icon-sm": { color: "icon-purple-600", size: "icon-sm" }
};

type CombinedId = keyof typeof data;

type CombinedSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
} & PropsWithChildrenAndLang;

const CombinedSectionContent = ({
  lang,
  children,
  collectionId,
  compName
}: CombinedSectionContentProps) => {
  const router = useRouter();
  const { setColor, setSize } = useBoxContext();
  const { copy, copied, more } = withLocale(lang).config("code-block");
  return (
    <Section>
      {children}
      <CodeElementOptionsStyler
        onTabChange={(_i, tab) => {
          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
            router.push(`/docs/styling?i=${collectionId}.${compName}`);
            return;
          }
          const { color, size } = data[tab as CombinedId] || { color: "", size: "" };
          setColor(color);
          setSize(size);
        }}
        showMore
        showMoreLabel={more}
        copy={copy}
        copied={copied}
        options={combined}
        component={compName}
      />
    </Section>
  );
};

export default CombinedSectionContent;
