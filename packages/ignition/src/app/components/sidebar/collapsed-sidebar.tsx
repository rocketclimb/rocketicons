"use client";
import { useDisclosure } from "@/components/modal-context";
import { useState } from "react";
import UrlObserver from "@/components/url-observer";

import Button from "@/components/button";
import { IoMenuOutline } from "rocketicons/io5";
import { PropsWithLang } from "@/app/types";
import { SidebarLeft } from "./sidebar-left";
import { siteConfig } from "@/config/site";
import { withLocale } from "@/app/locales";

export const CollapsedSidebar = ({ lang }: PropsWithLang) => {
  const [lastPath, setLastPath] = useState<string>("" as string);
  const [hash, setHash] = useState<string>("" as string);
  const { isOpen, open, close, Modal } = useDisclosure();
  const { menuConfig } = siteConfig;
  const { enSlug } = withLocale(lang);
  const notComponentMenu = menuConfig.componentGroups.indexOf(enSlug(lastPath)) === -1;

  const pathClassName = !hash || notComponentMenu ? `docs-${lastPath}` : "";
  const hashClassName = hash ? ` docs-${hash}` : "";

  return (
    <>
      <UrlObserver
        onChanges={({ lastPath, hash }) => {
          isOpen && close();
          setLastPath(lastPath);
          setHash(hash);
        }}
      />
      <div className={`${pathClassName}${hashClassName}`}>
        <div
          data-open={true}
          className="group fixed w-full top-[64px] sm:-ml-8 z-10 border-b border-slate-900/10 dark:border-slate-800 px-2 sm:px-8 py-3 backdrop-blur transition-colors duration-500 bg-white/95 dark:bg-slate-900/70 lg:hidden"
        >
          <div className="flex flex-col justify-between">
            <Button className="flex items-center" type="button" onClick={() => open()}>
              <IoMenuOutline className="icon-slate-500-xl dark:icon-slate-400-xl" />
            </Button>
          </div>
          <Modal>
            <div
              data-open={true}
              className="group fixed pl-4 pr-7 h-full overflow-y-auto bg-white dark:bg-slate-800"
            >
              <SidebarLeft lang={lang} />
            </div>
          </Modal>
        </div>
      </div>
      <div className="collapsed-menu lg:hidden"></div>
    </>
  );
};
