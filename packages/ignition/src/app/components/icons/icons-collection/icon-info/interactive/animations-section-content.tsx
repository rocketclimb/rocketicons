"use client";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import { Tab, CodeElementOptionsStyler, CodeElementTabs } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";
import { useBoxContext } from "./box";

const animations = ["animate-bounce", "animate-ping", "animate-pulse", "animate-spin"];

type AnimationsSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
} & PropsWithChildrenAndLang;

const AnimationsSectionContent = ({
  lang,
  children,
  collectionId,
  compName
}: AnimationsSectionContentProps) => {
  const router = useRouter();
  const { animation: selectedAnimation, setAnimation } = useBoxContext();
  const locale = withLocale(lang);
  const {
    "code-block": { copy, copied },
    "learn-more": learnMode
  } = locale.config("code-block", "learn-more");
  return (
    <Section>
      {children}
      <CodeElementOptionsStyler
        onTabChange={(_i, tab) => {
          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
            const selectedIcon = encodeURIComponent(`${collectionId}.${compName}`);
            const anchor = lang === "pt-br" ? "#animacoes" : "#animations";
            router.push(`${locale.docHref("styling")}?i=${selectedIcon}${anchor}`);
            return;
          }
          setAnimation(tab === CodeElementTabs.DEFAULT ? "" : (tab as string));
        }}
        showMore
        showMoreLabel={learnMode.toLowerCase()}
        copy={copy}
        copied={copied}
        selectedTab={selectedAnimation}
        options={animations}
        component={compName}
      />
    </Section>
  );
};

export default AnimationsSectionContent;
