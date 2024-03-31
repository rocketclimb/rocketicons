"use client";

import Button from "@/app/components/button";
import { PropsWithChildrenAndLangParams } from "@/app/types";
import { SidebarLeft } from "@/app/components/documentation";
import { useState } from "react";

const Layout = ({
  children,
  params: { lang },
}: PropsWithChildrenAndLangParams) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="flex flex-col grow">
      <div className="sticky top-[64px] z-10 border-b border-slate-800 px-4 py-3 backdrop-blur-sm  md:hidden">
        <div className="flex flex-col justify-between">
          <Button
            className="flex items-center gap-1"
            type="button"
            onClick={toggleMenu}
          >
            <svg
              fill="none"
              height="24"
              shapeRendering="geometricPrecision"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>{" "}
            <span>Menu</span>
          </Button>
          <>{menuOpen && <div className="h-screen w-full">menu content</div>}</>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
        <div className="hidden h-[calc(100vh-121px)] w-[284px] md:flex md:shrink-0 md:flex-col md:justify-between">
          <div className="relative overflow-hidden">
            <nav>
              <SidebarLeft params={{ lang }} />
            </nav>
          </div>
        </div>
        <article className="mt-4 w-full min-w-0 max-w-6xl px-1 md:px-6">
          {children}
        </article>
      </div>
      <div className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:flex md:flex-row md:py-10">
        footer
      </div>
    </div>
  );
};

export default Layout;
