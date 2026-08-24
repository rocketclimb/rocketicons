"use client";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import { Tab, CodeElementOptionsStyler, CodeElementTabs } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";
import { useBoxContext } from "./box";

const strokes = [
  "stroke-1",
  "stroke-2",
  "stroke-[0.5]",
  "stroke-[1.5]",
  "stroke-[3]",
  "stroke-[3.375]",
  "stroke-[0.375rem]",
  "stroke-[3px]"
];

const strokesId = {
  "stroke-1": "stroke1",
  "stroke-2": "stroke2",
  "stroke-[0.5]": "stroke05",
  "stroke-[1.5]": "stroke15",
  "stroke-[3]": "stroke3",
  "stroke-[3.375]": "stroke375",
  "stroke-[0.375rem]": "stroke0375rem",
  "stroke-[3px]": "stroke3px"
};

type StrokesId = keyof typeof strokesId;

type StrokeSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
  isOutlined: boolean;
} & PropsWithChildrenAndLang;

const StrokeSectionContent = ({
  lang,
  children,
  collectionId,
  isOutlined,
  compName
}: StrokeSectionContentProps) => {
  const router = useRouter();
  const { stroke: selectedStroke, setStroke } = useBoxContext();
  const locale = withLocale(lang);
  const { copy, copied, more } = locale.config("code-block");
  return (
    <Section data-outlined={isOutlined} className="data-[outlined=false]:hidden">
      {children}
      <CodeElementOptionsStyler
        onTabChange={(_i, tab) => {
          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
            const selectedIcon = encodeURIComponent(`${collectionId}.${compName}`);
            const anchor = lang === "pt-br" ? "#largura-de-linha" : "#stroke-width";
            router.push(`${locale.docHref("styling")}?i=${selectedIcon}${anchor}`);
            return;
          }
          setStroke(tab === CodeElementTabs.DEFAULT ? "" : strokesId[tab as StrokesId]);
        }}
        showMore
        showMoreLabel={more}
        copy={copy}
        copied={copied}
        selectedTab={selectedStroke}
        options={strokes}
        component={compName}
      />
    </Section>
  );
};

export default StrokeSectionContent;
