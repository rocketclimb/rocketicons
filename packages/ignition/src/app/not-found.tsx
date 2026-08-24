"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/logo";
import OnError from "./on-error";
import type { Languages } from "@/types";

const NotFound = () => {
  const [lang, setLang] = useState<Languages>("en");
  useEffect(() => {
    const pathname = window.location.pathname;
    const legacyIcon = pathname.match(/^\/(en|pt-br)\/icons\/([^/]+)\/([^/]+)\/?$/);
    if (legacyIcon) {
      const [, locale, collectionId, iconId] = legacyIcon;
      window.location.replace(
        `/${locale}/icons/${encodeURIComponent(collectionId)}/?icon=${encodeURIComponent(iconId)}`
      );
      return;
    }
    if (pathname.startsWith("/pt-br/")) setLang("pt-br");
  }, []);
  return (
    <OnError lang={lang} error="error_404">
      <div className="absolute bottom-0 left-0 size-12 xs:size-16 md:size-28 lg:size-56 ml-5 mb-5 lg:ml-10 lg:mb-10 rounded-full border-2 lg:border-[3px] border-[#333] dark:border-slate-400"></div>
      <Logo
        className="absolute bottom-0 left-0 h-14 xs:h-[70px] md:h-32 lg:h-[240px] ml-5 mb-5 lg:ml-10 lg:mb-10"
        noText
      />
    </OnError>
  );
};

export default NotFound;
