import { IoMdClose } from "rocketicons/io";
import { CodeStyler, CodeImportBlock, CodeElementBlock } from "@rocketclimb/code-block";
import { CollectionID } from "rocketicons/data";
import LinkButton from "@/components/link-button";

import Title3 from "@/components/documentation/title3";
import { MdxClientPartial } from "@/components/mdx";
import { PropsWithLang } from "@/types";
import { withLocale } from "@/locales";
import iconsSizes from "@/components/usage/sizing/sizes.json";

import Title5 from "@/components/documentation/title5";
import { IconHandlerProps } from "@/components/icons/icon-loader";

import Box from "./interactive/box";
import Section from "./interactive/section";
import Description from "./interactive/description";
import Reset from "./interactive/reset";
import LearnMore from "./interactive/learn-more";
import SizeSelector from "./interactive/size-selector";
import SizesSectionContent from "./interactive/sizes-section-content";
import ColorsSectionContent from "./interactive/colors-section-content";
import StrokeSectionContent from "./interactive/stroke-section-content";
import CombinedSectionContent from "./interactive/combined-section-content";
import DarkModeSectionContent from "./interactive/dark-mode-section-content";
import StatesSectionContent from "./interactive/states-section-content";
import AnimationsSectionContent from "./interactive/animations-section-content";
import SvgBox from "./interactive/svg-box";

const InfoHandler = ({
  lang,
  Icon,
  collectionId,
  iconInfo: info
}: { collectionId: CollectionID } & IconHandlerProps & PropsWithLang) => {
  const {
    "learn-more": learnMore,
    "code-block": { copy, copied }
  } = withLocale(lang).config("learn-more", "code-block");
  const allSizes = Object.keys(iconsSizes).map((size) => `icon-${size}`);

  const iconColorsClass = `
    group-data-[color=slate-700]/icon-panel:icon-slate-700 group-data-[color=gray-300]/icon-panel:icon-gray-300
    group-data-[color=zinc]/icon-panel:icon-zinc group-data-[color=neutral-600]/icon-panel:icon-neutral-600
    group-data-[color=stone]/icon-panel:icon-stone group-data-[color=red-800]/icon-panel:icon-red-800
    group-data-[color=orange-300]/icon-panel:icon-orange-300 group-data-[color=amber-900]/icon-panel:icon-amber-900
    group-data-[color=yellow]/icon-panel:icon-yellow group-data-[color=lime-200]/icon-panel:icon-lime-200
    group-data-[color=green-600]/icon-panel:icon-green-600 group-data-[color=emerald-200]/icon-panel:icon-emerald-200
    group-data-[color=teal-500]/icon-panel:icon-teal-500 group-data-[color=cyan-600]/icon-panel:icon-cyan-600
    group-data-[color=sky]/icon-panel:icon-sky group-data-[color=blue-400]/icon-panel:icon-blue-400
    group-data-[color=indigo-700]/icon-panel:icon-indigo-700 group-data-[color=purple-600]/icon-panel:icon-purple-600
    group-data-[color=fuchsia-800]/icon-panel:icon-fuchsia-800 group-data-[color=pink-600]/icon-panel:icon-pink-600
    group-data-[color=rose-300]/icon-panel:icon-rose-300`;

  const iconStrokeClass = `
    group-data-[stroke=stroke1]/icon-panel:stroke-1 group-data-[stroke=stroke2]/icon-panel:stroke-2
    group-data-[stroke=stroke05]/icon-panel:stroke-[0.5] group-data-[stroke=stroke15]/icon-panel:stroke-[1.5]
    group-data-[stroke=stroke3]/icon-panel:stroke-[3] group-data-[stroke=stroke375]/icon-panel:stroke-[3.375]
    group-data-[stroke=stroke0375rem]/icon-panel:stroke-[0.375rem] group-data-[stroke=stroke3px]/icon-panel:stroke-[3px]
    `;

  const iconAnimationClass = `
    group-data-[animation=animate-bounce]/icon-panel:animate-bounce group-data-[animation=animate-ping]/icon-panel:animate-ping
    group-data-[animation=animate-pulse]/icon-panel:animate-pulse group-data-[animation=animate-spin]/icon-panel:animate-spin
    `;

  return (
    <Box>
      <LinkButton
        href={`/${lang}/icons/${collectionId}`}
        className="absolute top-1 right-1 flex items-center justify-center"
      >
        <IoMdClose className="icon-slate-500 icon-lg hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
      </LinkButton>
      <Title3 className="absolute top-1 left-1 md:left-2 icon-info-title content-box capitalize col-span-8 justify-start">
        {info.name}
      </Title3>
      <div className="mt-8 flex flex-col h-full md:flex-row">
        <div className="grid grid-cols-8 h-40 md:h-56 md:mt-2.5 border-b md:border-b-0 md:border-r border-surface-border dark:border-surface-dark mb-1 md:mb-0 md:mr-1 md:w-80 md:flex-shrink-0">
          <div className="col-span-5 w-full rounded-md flex relative items-center justify-center">
            <Icon
              className={`size-36 icon-secondary-medium dark:icon-secondary ${iconColorsClass} ${iconStrokeClass} ${iconAnimationClass}`}
            />
            <Reset />
          </div>
          <div className="col-span-3 py-1 thin-scroll overflow-y-auto">
            <div className="flex flex-col items-center">
              {allSizes.reverse().map((size) => (
                <SizeSelector key={`size-box-${size}`} size={size}>
                  <Icon
                    className={`${size} icon-secondary-medium dark:icon-secondary ${iconColorsClass} ${iconStrokeClass} ${iconAnimationClass}`}
                  />
                </SizeSelector>
              ))}
            </div>
          </div>
        </div>
        <div className="thin-scroll overflow-y-auto md:overflow-y-hidden md:flex md:overflow-x-auto">
          <Section>
            <MdxClientPartial path="components" lang={lang} slug="icon-info-import" />
            <CodeImportBlock
              lang="js"
              copy={copy}
              copied={copied}
              className="flex"
              component={info.compName}
              module={`rocketicons/${collectionId}`}
            />
            <MdxClientPartial path="components" lang={lang} slug="icon-info-usage" />
            <CodeStyler variant="compact">
              <CodeElementBlock
                copy={copy}
                copied={copied}
                className="text-xs"
                component={info.compName}
              />
            </CodeStyler>
            <SvgBox copiedLabel={copied} collectionId={collectionId} iconId={info.id} />
          </Section>
          <SizesSectionContent
            lang={lang}
            collectionId={collectionId}
            compName={info?.compName}
            sizes={allSizes}
          >
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-sizing" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/sizing-icons?i=${collectionId}.${info.compName}`}
              />
            </Description>
          </SizesSectionContent>
          <ColorsSectionContent lang={lang} collectionId={collectionId} compName={info?.compName}>
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-colors" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/sizing-colors?i=${collectionId}.${info.compName}`}
              />
            </Description>
          </ColorsSectionContent>
          <StrokeSectionContent
            isOutlined={info?.variant === "outlined" || info?.variant === "full"}
            lang={lang}
            collectionId={collectionId}
            compName={info?.compName}
          >
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-stroke" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/styling?i=${collectionId}.${info.compName}#stroke-width`}
              />
            </Description>
          </StrokeSectionContent>
          <CombinedSectionContent
            lang={lang}
            collectionId={collectionId}
            compName={info?.compName}
          >
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-combining" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/shortcuts?i=${collectionId}.${info.compName}`}
              />
            </Description>
          </CombinedSectionContent>
          <DarkModeSectionContent
            lang={lang}
            collectionId={collectionId}
            compName={info?.compName}
          >
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-dark" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/dark-mode?i=${collectionId}.${info.compName}`}
              />
            </Description>
          </DarkModeSectionContent>
          <StatesSectionContent lang={lang} collectionId={collectionId} compName={info?.compName}>
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-states" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/state-management?i=${collectionId}.${info.compName}`}
              />
            </Description>
          </StatesSectionContent>
          <AnimationsSectionContent
            lang={lang}
            collectionId={collectionId}
            compName={info?.compName}
          >
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-animations" />
              <LearnMore
                label={learnMore}
                href={`/${lang}/docs/styling?i=${collectionId}.${info.compName}#animations`}
              />
            </Description>
          </AnimationsSectionContent>
          <Section>
            <Description>
              <MdxClientPartial path="components" lang={lang} slug="icon-info-styling" />
              <LearnMore label={learnMore} href={`/${lang}/docs/adding-icons`} />
            </Description>
          </Section>
          <Section>
            <Title5>Tags</Title5>
            <div className="px-2 py-px border border-sky-100 bg-sky-50 rounded-full inline-block text-xs text-on-secondary-lighter">
              {info?.variant}
            </div>
          </Section>
        </div>
      </div>
    </Box>
  );
};

export default InfoHandler;
