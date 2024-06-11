"use client";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import { Tab, CodeElementOptionsStyler, CodeElementTabs } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";
import { useBoxContext } from "./box";

const colors = [
  "icon-slate-700",
  "icon-gray-300",
  "icon-zinc",
  "icon-neutral-600",
  "icon-stone",
  "icon-red-800",
  "icon-orange-300",
  "icon-amber-900",
  "icon-yellow",
  "icon-lime-200",
  "icon-green-600",
  "icon-emerald-200",
  "icon-teal-500",
  "icon-cyan-600",
  "icon-sky",
  "icon-blue-400",
  "icon-indigo-700",
  "icon-purple-600",
  "icon-fuchsia-800",
  "icon-pink-600",
  "icon-rose-300"
];

type ColorsSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
} & PropsWithChildrenAndLang;

const ColorsSectionContent = ({
  lang,
  children,
  collectionId,
  compName
}: ColorsSectionContentProps) => {
  const router = useRouter();
  const { color: selectedColor, setColor } = useBoxContext();
  const { copy, copied, more } = withLocale(lang).config("code-block");
  return (
    <Section>
      {children}
      <CodeElementOptionsStyler
        onTabChange={(_i, tab) => {
          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
            router.push(`/docs/colors?i=${collectionId}.${compName}`);
            return;
          }
          setColor(tab === CodeElementTabs.DEFAULT ? "" : (tab as string));
        }}
        showMore
        showMoreLabel={more}
        copy={copy}
        copied={copied}
        selectedTab={selectedColor}
        options={colors}
        component={compName}
      />
    </Section>
  );
};

export default ColorsSectionContent;
