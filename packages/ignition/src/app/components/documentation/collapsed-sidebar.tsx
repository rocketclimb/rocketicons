"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IoChevronForwardSharp } from "rocketicons/io5";
import Button from "@/components/button";
import { SidebarLeft } from "./sidebar-left";
import { PropsWithLang } from "@/app/types";

export const CollapsedSidebar = ({ lang }: PropsWithLang) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const pathName = usePathname();

  return (
    <div className={`docs-${pathName.split("/").pop()}`}>
      <div
        data-open={menuOpen}
        className="group sticky top-[64px] z-10 border-b border-slate-800 px-4 py-3 backdrop-blur-sm lg:hidden"
      >
        <div className="flex flex-col justify-between">
          <Button
            className="flex items-center gap-1"
            type="button"
            onClick={toggleMenu}
          >
            <IoChevronForwardSharp />
            <span>Menu</span>
          </Button>
          <div className="h-screen w-full  hidden group-data-[open=true]:block">
            <SidebarLeft lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
};
