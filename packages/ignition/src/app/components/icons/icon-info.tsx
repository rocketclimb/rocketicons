"use client";
import { PropsWithChildren, useState } from "react";
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

type IconInfoProps = {
  show: boolean;
  collectionId: CollectionID;
  Icon: IconType;
  info?: IconInfoType;
  onClose: () => void;
};

const Paragraph = ({ children }: PropsWithChildren) => (
  <p className="text-sm my-3">{children}</p>
);

type SectionTitleProps = {
  onClick: () => void;
  selected: boolean;
} & PropsWithChildren;

const SectionTitle = ({ selected, children, onClick }: SectionTitleProps) => (
  <h5
    onClick={() => onClick()}
    data-selected={selected}
    className="text-sm font-bold mr-6 text-slate-200 cursor-default border-b-2 border-transparent pb-2.5 data-[selected=false]:cursor-pointer data-[selected=true]:dark:text-sky-500 data-[selected=true]:dark:border-sky-500 dark:text-slate-200 data-[selected=false]:dark:hover:border-slate-700"
  >
    {children}
  </h5>
);

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
    <div
      data-open={show}
      className="group/info transition-all duration-200 absolute -z-20 top-60 w-0 data-[open=true]:w-[550px] data-[open=true]:z-auto"
    >
      <div className="group-data-[open=false]/info:animate-delayed-hidden flex flex-col group-data-[open=true]/info:border border-slate-200 group-data-[open=true]/info:dark:border-2 dark:border-slate-700 rounded-xl px-3 py-2 h-[655px]">
        <div className="opacity-0 group-data-[open=true]/info:opacity-100 group-data-[open=true]/info:animate-delayed-appearing">
          <Button
            onClick={() => onClose()}
            className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center"
          >
            <IoMdClose className="icon-slate-500 hover:icon-slate-600 dark:icon-slate-400 dark:hover:icon-slate-300" />
          </Button>
          <h2 className="capitalize font-bold text-2xl text-center text-slate-900 tracking-tight dark:text-slate-200">
            {info?.name}
          </h2>
          <div className="grid grid-cols-8">
            <div className="row-span-2 col-span-2 flex items-center justify-center">
              {Icon && <Icon className={selected} />}
            </div>
            <div className="col-span-6">
              <Paragraph>
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
              <Paragraph>Place the element wherever you need</Paragraph>
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
                <h4 className="text-xl font-bold mr-4 mb-3 text-slate-900 tracking-tight dark:text-slate-200">
                  Styling
                </h4>
                <p className="text-base text-slate-400">
                  You can use Tailwind{" "}
                  <a href="https://tailwindcss.com/docs/size">sizes</a> or even
                  define it using{" "}
                  <a href="https://tailwindcss.com/docs/height">height</a> and{" "}
                  <a href="https://tailwindcss.com/docs/width">width</a>{" "}
                  classes, however few helpers sizes classes are defined to make
                  your work even easier. and few more words
                </p>
              </div>
              <div className="mt-6 p-2">
                <div className="flex border-b dark:border-gray-200/5">
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
                  <Paragraph>
                    You can use Tailwind{" "}
                    <a href="https://tailwindcss.com/docs/size">sizes</a> or
                    even define it using{" "}
                    <a href="https://tailwindcss.com/docs/height">height</a> and{" "}
                    <a href="https://tailwindcss.com/docs/width">width</a>{" "}
                    classes, however few helpers sizes classes are defined to
                    make your work even easier.
                  </Paragraph>
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
                  <Paragraph>
                    You can use Tailwind{" "}
                    <a href="https://tailwindcss.com/docs/customizing-colors">
                      colors
                    </a>{" "}
                    however few helpers colors classes are defined to make your
                    work even easier.
                  </Paragraph>
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
      </div>
    </div>
  );
};

export default IconInfo;
