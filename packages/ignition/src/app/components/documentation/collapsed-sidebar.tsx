"use client";
import { usePathname } from "next/navigation";
import { IoChevronForwardSharp } from "rocketicons/io5";
import Button from "@/components/button";
import { SidebarLeft } from "./sidebar-left";
import { PropsWithLang } from "@/app/types";
import { Modal, useDisclosure } from "@/components/modal-context";

export const CollapsedSidebar = ({ lang }: PropsWithLang) => {
  const { onOpen, onClose } = useDisclosure();

  const pathName = usePathname();

  return (
    <>
      <div className={`docs-${pathName.split("/").pop()}`}>
        <div
          data-open={true}
          className="group sticky top-[64px] z-10 border-b border-slate-900/10 dark:border-slate-800 px-4 py-3 backdrop-blur-sm lg:hidden"
        >
          <div className="flex flex-col justify-between">
            <Button
              className="flex items-center gap-1"
              type="button"
              onClick={() => onOpen()}
            >
              <IoChevronForwardSharp />
              <span>Menu</span>
            </Button>
          </div>
          <Modal>
            <div
              data-open={true}
              className="group fixed pl-3 pr-7 bg-white dark:bg-slate-800"
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
