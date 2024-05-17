"use client";
import { IoMenuOutline } from "rocketicons/io5";
import { useDisclosure } from "@/components/modal-context";
import Button from "@/components/button";
import { PropsWithLang } from "@/types";
import { SidebarLeft } from "./sidebar-left";

export const CollapsedSidebar = ({ lang }: PropsWithLang) => {
  const { isOpen, open, Modal } = useDisclosure();

  return (
    <div className="landingpage:hidden">
      <div
        data-open={isOpen}
        className="group w-full py-3 transition-colors duration-500 lg:hidden"
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
  );
};
