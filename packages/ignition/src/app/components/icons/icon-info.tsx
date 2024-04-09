"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconType } from "rocketicons";
import { IconInfo as IconInfoType } from "@rocketicons/core";
import { IoMdClose } from "rocketicons/io";
import Button from "@/components/button";
import {
  Tab,
  CodeStyler,
  CodeImportBlock,
  CodeElementBlock,
  CodeElementOptionsStyler,
  CodeElementTabs,
} from "@/components/code-block";
import { CollectionID } from "rocketicons/data";
import FloatBlock from "@/components/icons/float-block";
import { Title3, SectionTitle, Prose } from "@/components/documentation";
import { MdxClientPartial } from "@/components/mdx";
import { PropsWithLang } from "@/types";
import { useLocale } from "@/locales";

type IconInfoProps = {
  show: boolean;
  collectionId: CollectionID;
  Icon: IconType;
  info?: IconInfoType;
  onClose: () => void;
} & PropsWithLang;

const IconInfo = ({
  lang,
  show,
  collectionId,
  info,
  Icon,
  onClose,
}: IconInfoProps) => {
  const router = useRouter();

  const {
    colors,
    sizes,
    combining,
    "dark-mode": darkMode,
    states,
  } = useLocale(lang).config(
    "colors",
    "sizes",
    "combining",
    "dark-mode",
    "states"
  );

  const defaultStyle = "icon-xl lg:icon-7xl";
  const [section, setSection] = useState<string>("sizes");
  const [selected, setSelected] = useState<string>(defaultStyle);

  return (
    <>
      <div
        data-open={show}
        className="group/info icon-info-area transition-all duration-200 fixed top-20 pr-2 sm:pr-16 lg:pr-0 lg:sticky -z-20 lg:top-40 w-0 pb-3 lg:pb-0 data-[open=true]:w-full data-[open=true]:md:w-[550px] data-[open=true]:z-40"
      >
        <FloatBlock className="group-data-[open=false]/info:animate-delayed-hidden relative flex flex-col group-data-[open=true]/info:border group-data-[open=true]/info:dark:border-2 px-3 py-2 h-full lg:h-[655px]">
          <div className="panel opacity-0 group-data-[open=true]/info:opacity-100 group-data-[open=true]/info:animate-delayed-appearing h-full">
            <Button
              onClick={() => onClose()}
              className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center"
            >
              <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
            </Button>
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-8">
                <Title3 className="icon-info-title capitalize col-span-6 lg:col-span-8 justify-center">
                  {info?.name}
                </Title3>
                <div className="order-first lg:order-none lg:row-span-2 col-span-2 flex items-center justify-center">
                  {Icon && <Icon className={selected} />}
                </div>
                <div className="col-span-8 lg:col-span-6">
                  <MdxClientPartial
                    path="components"
                    lang={lang}
                    slug="icon-info-import"
                  />
                  {info && (
                    <CodeStyler variant="compact">
                      <CodeImportBlock
                        locale={lang}
                        className="text-xs flex"
                        component={info.compName}
                        module={`rocketicons/${collectionId}`}
                      />
                    </CodeStyler>
                  )}
                </div>
                <div className="col-span-8 lg:col-span-6">
                  <MdxClientPartial
                    path="components"
                    lang={lang}
                    slug="icon-info-usage"
                  />
                  <CodeStyler variant="compact">
                    {info && (
                      <CodeElementBlock
                        locale={lang}
                        className="text-xs"
                        component={info.compName}
                      />
                    )}
                  </CodeStyler>
                </div>
              </div>
              <div
                data-section={section}
                className="group/sections grow max-lg:overflow-y-auto my-3 mx-1 p-3 pb rounded-xl bg-slate-50 dark:bg-slate-800/35"
              >
                <div>
                  <MdxClientPartial
                    path="components"
                    lang={lang}
                    slug="icon-info-styling"
                  />
                </div>
                <div className="mt-4 p-2">
                  <div className="flex overflow-y-auto thin-scroll mb-2 border-b dark:border-gray-200/5">
                    <SectionTitle
                      onClick={() => setSection("sizes")}
                      selected={section === "sizes"}
                    >
                      {sizes}
                    </SectionTitle>
                    <SectionTitle
                      onClick={() => setSection("colors")}
                      selected={section === "colors"}
                    >
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
                  <div className="hidden group-data-[section=sizes]/sections:block">
                    <div className="mb-3">
                      <MdxClientPartial
                        path="components"
                        lang={lang}
                        slug="icon-info-sizing"
                      />
                    </div>
                    {info && (
                      <CodeElementOptionsStyler
                        onTabChange={(_i, tab) => {
                          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
                            router.push(
                              `/docs/sizing?i=${collectionId}.${info?.name}`
                            );
                            return;
                          }
                          setSelected(
                            tab === CodeElementTabs.DEFAULT
                              ? defaultStyle
                              : (tab as string)
                          );
                        }}
                        showMore
                        locale={lang}
                        options={["icon-xl", "icon-lg", "icon-base", "icon-sm"]}
                        component={info.compName}
                      />
                    )}
                  </div>
                  <div className="hidden group-data-[section=colors]/sections:block">
                    <div className="mb-3">
                      <MdxClientPartial
                        path="components"
                        lang={lang}
                        slug="icon-info-colors"
                      />
                    </div>
                    {info && (
                      <CodeElementOptionsStyler
                        onTabChange={(_i, tab) => {
                          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
                            router.push(
                              `/docs/colors?i=${collectionId}.${info?.compName}`
                            );
                            return;
                          }
                          setSelected(
                            tab === CodeElementTabs.DEFAULT
                              ? defaultStyle
                              : (tab as Tab).id
                          );
                        }}
                        showMore
                        locale={lang}
                        options={[
                          {
                            id: "icon-violet-xl lg:icon-violet-7xl",
                            name: "icon-violet",
                          },
                          {
                            id: "icon-red-600-xl lg:icon-red-600-7xl",
                            name: "icon-red-600",
                          },
                          {
                            id: "icon-sky-300-xl lg:icon-sky-300-7xl",
                            name: "icon-sky-300",
                          },
                        ]}
                        component={info.compName}
                      />
                    )}
                  </div>
                  <div className="hidden group-data-[section=combining]/sections:block">
                    <div className="mb-3">
                      <MdxClientPartial
                        path="components"
                        lang={lang}
                        slug="icon-info-combining"
                      />
                    </div>
                    {info && (
                      <CodeElementOptionsStyler
                        onTabChange={(_i, tab) => {
                          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
                            router.push(
                              `/docs/styling?i=${collectionId}.${info?.compName}`
                            );
                            return;
                          }
                          setSelected(
                            tab === CodeElementTabs.DEFAULT
                              ? defaultStyle
                              : (tab as string)
                          );
                        }}
                        showMore
                        locale={lang}
                        options={["icon-blue-2xl", "icon-purple-600-sm"]}
                        component={info.compName}
                      />
                    )}
                  </div>
                  <div className="hidden group-data-[section=dark-mode]/sections:block">
                    <div className="mb-3">
                      <MdxClientPartial
                        path="components"
                        lang={lang}
                        slug="icon-info-dark"
                      />
                    </div>
                    {info && (
                      <CodeStyler variant="compact">
                        {info && (
                          <CodeElementBlock
                            locale={lang}
                            className="text-xs"
                            attrs={{
                              className:
                                "icon-indigo-800-lg border border-slate-900 dark:icon-purple-900-7xl dark:border-none",
                            }}
                            component={info.compName}
                          />
                        )}
                      </CodeStyler>
                    )}
                  </div>
                  <div className="hidden group-data-[section=states]/sections:block">
                    <div className="mb-3">
                      <MdxClientPartial
                        path="components"
                        lang={lang}
                        slug="icon-info-states"
                      />
                    </div>
                    {info && (
                      <CodeStyler variant="compact">
                        {info && (
                          <CodeElementBlock
                            locale={lang}
                            className="text-xs"
                            attrs={{
                              className:
                                "transition-all duration-200 icon-indigo-800-5xl hover:icon-purple-900-7xl",
                            }}
                            component={info.compName}
                          />
                        )}
                      </CodeStyler>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FloatBlock>
      </div>
    </>
  );
};

export default IconInfo;
