"use client";
import { useState } from "react";
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
} from "@/components/code-block";
import { CollectionID } from "rocketicons/data";
import RocketIconsText from "@/components/rocketicons-text";
import FloatBlock from "@/components/icons/float-block";
import {
  Title3,
  Title4,
  SectionTitle,
  Paragraph,
  Prose,
} from "@/components/documentation";

type IconInfoProps = {
  show: boolean;
  collectionId: CollectionID;
  Icon: IconType;
  info?: IconInfoType;
  onClose: () => void;
};

const IconInfo = ({
  show,
  collectionId,
  info,
  Icon,
  onClose,
}: IconInfoProps) => {
  const defaultStyle = "icon-7xl";
  const [section, setSection] = useState<string>("sizes");
  const [selected, setSelected] = useState<string>(defaultStyle);
  return (
    <>
      <div
        data-open={show}
        className="hidden data-[open=true]:block data-[open=true]:lg:hidden fixed bg-white h-full w-full dark:bg-slate-900 top-0 right-0 z-30"
      ></div>
      <div
        data-open={show}
        className="group/info transition-all duration-200 fixed lg:sticky -z-20 top-40 w-0 data-[open=true]:w-[550px] data-[open=true]:z-40 data-[open=true]:lg:z-40"
      >
        <FloatBlock className="group-data-[open=false]/info:animate-delayed-hidden flex flex-col group-data-[open=true]/info:border group-data-[open=true]/info:dark:border-2 px-3 py-2 h-[655px]">
          <div className="panel opacity-0 group-data-[open=true]/info:opacity-100 group-data-[open=true]/info:animate-delayed-appearing">
            <Button
              onClick={() => onClose()}
              className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center"
            >
              <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
            </Button>
            <Title3 className="capitalize justify-center">{info?.name}</Title3>
            <div className="grid grid-cols-8">
              <div className="row-span-2 col-span-2 flex items-center justify-center">
                {Icon && <Icon className={selected} />}
              </div>
              <div className="col-span-6">
                <Paragraph className="mb-1.5">
                  Import the icon component from <RocketIconsText />
                </Paragraph>
                {info && (
                  <CodeStyler variant="compact">
                    <CodeImportBlock
                      className="text-xs"
                      component={info.compName}
                      module={`rocketicons/${collectionId}`}
                    />
                  </CodeStyler>
                )}
              </div>
              <div className="col-span-6">
                <Paragraph className="mt-3 mb-1.5">
                  Place the element wherever you need
                </Paragraph>
                <CodeStyler variant="compact">
                  {info && (
                    <CodeElementBlock
                      className="text-xs"
                      component={info.compName}
                    />
                  )}
                </CodeStyler>
              </div>
              <div
                data-section={section}
                className="group/sections col-span-8 my-3 mx-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/35"
              >
                <div>
                  <Title4>Styling</Title4>
                  <Paragraph>
                    You can use Tailwind{" "}
                    <a href="https://tailwindcss.com/docs/size">sizes</a> or
                    even define it using{" "}
                    <a href="https://tailwindcss.com/docs/height">height</a> and{" "}
                    <a href="https://tailwindcss.com/docs/width">width</a>{" "}
                    classes, however few helpers sizes classes are defined to
                    make your work even easier. and few more words
                  </Paragraph>
                </div>
                <div className="mt-6 p-2">
                  <div className="flex mb-2 border-b dark:border-gray-200/5">
                    <SectionTitle
                      onClick={() => setSection("sizes")}
                      selected={section === "sizes"}
                    >
                      Sizes
                    </SectionTitle>
                    <SectionTitle
                      onClick={() => setSection("colors")}
                      selected={section === "colors"}
                    >
                      Colors
                    </SectionTitle>
                  </div>
                  <div className="hidden group-data-[section=sizes]/sections:block">
                    <Prose>
                      You can use Tailwind{" "}
                      <a href="https://tailwindcss.com/docs/size">sizes</a> or
                      even define it using{" "}
                      <a href="https://tailwindcss.com/docs/height">height</a>{" "}
                      and <a href="https://tailwindcss.com/docs/width">width</a>{" "}
                      classes, however few helpers sizes classes are defined to
                      make your work even easier.
                    </Prose>
                    {info && (
                      <CodeElementOptionsStyler
                        onTabChange={(_i, tab) =>
                          setSelected(
                            tab === "default" ? defaultStyle : (tab as string)
                          )
                        }
                        options={["icon-xl", "icon-sm", "icon-base", "icon-lg"]}
                        component={info.compName}
                      />
                    )}
                  </div>
                  <div className="hidden group-data-[section=colors]/sections:block">
                    <Prose>
                      You can use Tailwind{" "}
                      <a href="https://tailwindcss.com/docs/customizing-colors">
                        colors
                      </a>{" "}
                      however few helpers colors classes are defined to make
                      your work even easier.
                    </Prose>
                    {info && (
                      <CodeElementOptionsStyler
                        onTabChange={(_i, tab) =>
                          setSelected(
                            tab === "default" ? defaultStyle : (tab as Tab).id
                          )
                        }
                        options={[
                          { id: "icon-slate-7xl", name: "icon-slate" },
                          { id: "icon-orange-7xl", name: "icon-orange" },
                          { id: "icon-yellow-7xl", name: "icon-yellow" },
                          { id: "icon-sky-7xl", name: "icon-sky" },
                          { id: "icon-sky-300-7xl", name: "icon-sky-300" },
                        ]}
                        component={info.compName}
                      />
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
