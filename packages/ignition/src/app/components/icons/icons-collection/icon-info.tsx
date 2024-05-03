"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdClose } from "rocketicons/io";
import { RcRocketIcon } from "rocketicons/rc";
import Button from "@/components/button";
import {
  Tab,
  CodeStyler,
  CodeImportBlock,
  CodeElementBlock,
  CodeElementOptionsStyler,
  CodeElementTabs
} from "@/components/code-block";
import { CollectionID } from "rocketicons/data";
import Title3 from "@/components/documentation/title3";
import SectionTitle from "@/components/documentation/section-title";
import SectionContent from "@/components/documentation/section-content";
import UpdateAlert from "@/components/documentation/update-alert";
import { MdxClientPartial } from "@/components/mdx";
import { PropsWithLang } from "@/types";
import { withLocale } from "@/locales";

import IconLoader, { IconHandlerProps } from "@/components/icons/icon-loader";

const InfoHandler = ({
  lang,
  Icon,
  collectionId,
  iconInfo: info
}: { icon: string; collectionId: CollectionID } & IconHandlerProps & PropsWithLang) => {
  const {
    colors,
    sizes,
    combining,
    "dark-mode": darkMode,
    states
  } = withLocale(lang).config("colors", "sizes", "combining", "dark-mode", "states");

  const router = useRouter();

  const defaultStyle = "icon-2xl lg:icon-7xl";
  const [section, setSection] = useState<string>("sizes");
  const [bounce, setBounce] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(defaultStyle);
  return (
    <div className="panel opacity-0 group-data-[open=true]/info:opacity-100 group-data-[open=true]/info:animate-delayed-appearing h-full">
      <Button
        onClick={() => router.push(`/${lang}/icons/${collectionId}`)}
        className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center"
      >
        <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
      </Button>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-8">
          <Title3 className="icon-info-title capitalize col-span-8 justify-center">
            {info.name}
          </Title3>
          <div className="order-first lg:order-none lg:row-span-2 size-10 rounded-md lg:size-auto lg:col-span-2 absolute lg:static flex items-center justify-center">
            <Icon
              data-bounce={bounce}
              className={`data-[bounce=true]:animate-bounce ${selected}`}
            />
          </div>
          <div className="col-span-8 lg:col-span-6 thin">
            <MdxClientPartial
              path="components"
              className="h-9"
              lang={lang}
              slug="icon-info-import"
            />
            <CodeStyler variant="compact">
              <CodeImportBlock
                locale={lang}
                className="text-xs flex"
                component={info.compName}
                module={`rocketicons/${collectionId}`}
              />
            </CodeStyler>
          </div>
          <div className="col-span-8 lg:col-span-6 thin">
            <MdxClientPartial
              path="components"
              className="h-9"
              lang={lang}
              slug="icon-info-usage"
            />
            <CodeStyler variant="compact">
              <CodeElementBlock locale={lang} className="text-xs" component={info.compName} />
            </CodeStyler>
          </div>
        </div>
        <div
          data-section={section}
          className="group/sections grow max-lg:overflow-y-auto my-3 mx-1 px-3 pb-3 rounded-xl bg-slate-50 dark:bg-slate-800/35"
        >
          <div>
            <MdxClientPartial
              path="components"
              className="h-[100px]"
              lang={lang}
              slug="icon-info-styling"
            />
          </div>
          <div className="mt-2 p-2 pb-0">
            <div className="flex overflow-y-auto thin-scroll mb-2 border-b dark:border-gray-200/5">
              <SectionTitle onClick={() => setSection("sizes")} selected={section === "sizes"}>
                {sizes}
              </SectionTitle>
              <SectionTitle onClick={() => setSection("colors")} selected={section === "colors"}>
                {colors}
              </SectionTitle>
              <SectionTitle
                onClick={() => setSection("combining")}
                selected={section === "combining"}
              >
                {combining}
              </SectionTitle>
              <SectionTitle
                onClick={() => {
                  setSection("dark-mode");
                  setSelected(
                    "icon-indigo-800-5xl p-1 rounded-sm border border-slate-900 dark:icon-purple-900-7xl dark:border-none"
                  );
                }}
                selected={section === "dark-mode"}
              >
                {darkMode}
              </SectionTitle>
              <SectionTitle
                onClick={() => {
                  setSection("states");
                  setSelected(
                    "transition-all duration-200 icon-indigo-800-5xl hover:icon-purple-900-7xl"
                  );
                }}
                selected={section === "states"}
              >
                {states}
              </SectionTitle>
            </div>
            <div className="relative w-full overflow-hidden flex">
              <SectionContent className="transition-all duration-300 group-data-[section=sizes]/sections:-ml-[0%] group-data-[section=colors]/sections:-ml-[100%] group-data-[section=combining]/sections:-ml-[200%] group-data-[section=dark-mode]/sections:-ml-[300%] group-data-[section=states]/sections:-ml-[400%]">
                <div className="mb-4 prose h-11">
                  <MdxClientPartial path="components" lang={lang} slug="icon-info-sizing" />
                </div>
                <CodeElementOptionsStyler
                  onTabChange={(_i, tab) => {
                    if ((tab as Tab)?.id === CodeElementTabs.MORE) {
                      router.push(`/docs/sizing-icons?i=${collectionId}.${info?.compName}`);
                      return;
                    }
                    setSelected(tab === CodeElementTabs.DEFAULT ? defaultStyle : (tab as string));
                  }}
                  showMore
                  locale={lang}
                  options={["icon-xl", "icon-lg", "icon-base", "icon-sm"]}
                  component={info.compName}
                />
                <UpdateAlert
                  lang={lang}
                  onMouseEnter={() => setBounce(true)}
                  onMouseLeave={() => setBounce(false)}
                  alert="changes"
                />
              </SectionContent>
              <SectionContent>
                <div className="mb-4 prose">
                  <MdxClientPartial path="components" lang={lang} slug="icon-info-colors" />
                </div>
                <CodeElementOptionsStyler
                  onTabChange={(_i, tab) => {
                    if ((tab as Tab)?.id === CodeElementTabs.MORE) {
                      router.push(`/docs/colors?i=${collectionId}.${info?.compName}`);
                      return;
                    }
                    setSelected(tab === CodeElementTabs.DEFAULT ? defaultStyle : (tab as Tab).id);
                  }}
                  showMore
                  locale={lang}
                  options={[
                    {
                      id: "icon-violet-xl lg:icon-violet-7xl",
                      name: "icon-violet"
                    },
                    {
                      id: "icon-red-600-xl lg:icon-red-600-7xl",
                      name: "icon-red-600"
                    },
                    {
                      id: "icon-sky-300-xl lg:icon-sky-300-7xl",
                      name: "icon-sky-300"
                    }
                  ]}
                  component={info.compName}
                />
                <UpdateAlert
                  lang={lang}
                  onMouseEnter={() => setBounce(true)}
                  onMouseLeave={() => setBounce(false)}
                  alert="changes"
                />
              </SectionContent>
              <SectionContent>
                <div className="mb-4 prose">
                  <MdxClientPartial path="components" lang={lang} slug="icon-info-combining" />
                </div>
                {info && (
                  <CodeElementOptionsStyler
                    onTabChange={(_i, tab) => {
                      if ((tab as Tab)?.id === CodeElementTabs.MORE) {
                        router.push(`/docs/styling?i=${collectionId}.${info?.compName}`);
                        return;
                      }
                      setSelected(
                        tab === CodeElementTabs.DEFAULT ? defaultStyle : (tab as string)
                      );
                    }}
                    showMore
                    locale={lang}
                    options={["icon-blue-2xl", "icon-purple-600-sm"]}
                    component={info.compName}
                  />
                )}
                <UpdateAlert
                  lang={lang}
                  onMouseEnter={() => setBounce(true)}
                  onMouseLeave={() => setBounce(false)}
                  alert="changes"
                />
              </SectionContent>
              <SectionContent>
                <div className="mb-4 prose">
                  <MdxClientPartial path="components" lang={lang} slug="icon-info-dark" />
                </div>
                <CodeStyler variant="compact">
                  <CodeElementBlock
                    locale={lang}
                    className="text-xs"
                    attrs={{
                      className:
                        "icon-indigo-800-lg border border-slate-900 dark:icon-purple-900-7xl dark:border-none"
                    }}
                    component={info.compName}
                  />
                </CodeStyler>
                <UpdateAlert
                  lang={lang}
                  onMouseEnter={() => setBounce(true)}
                  onMouseLeave={() => setBounce(false)}
                  alert="dark-mode"
                />
              </SectionContent>
              <SectionContent>
                <div className="mb-4 prose">
                  <MdxClientPartial path="components" lang={lang} slug="icon-info-states" />
                </div>
                <CodeStyler variant="compact">
                  {info && (
                    <CodeElementBlock
                      locale={lang}
                      className="text-xs flex no-wrap"
                      attrs={{
                        className:
                          "transition-all duration-200 icon-indigo-800-5xl hover:icon-purple-900-7xl"
                      }}
                      component={info.compName}
                    />
                  )}
                </CodeStyler>
                <UpdateAlert
                  lang={lang}
                  onMouseEnter={() => setBounce(true)}
                  onMouseLeave={() => setBounce(false)}
                  alert="hover"
                />
              </SectionContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loading = () => (
  <div className="h-full w-full flex justify-center items-center">
    <RcRocketIcon className="animate-ping size-16 lg:size-28" />
  </div>
);

type IconInfoProps = {
  iconId: string;
  collectionId: CollectionID;
} & PropsWithLang;

const IconInfo = ({ lang, collectionId, iconId }: IconInfoProps) => (
  <IconLoader
    collectionId={collectionId}
    icon={iconId}
    Loading={Loading}
    Handler={InfoHandler}
    lang={lang}
  />
);

export default IconInfo;
