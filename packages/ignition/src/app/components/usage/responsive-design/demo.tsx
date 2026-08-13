"use client";
import { useState } from "react";
import { PropsWithLang } from "@/types";
import GridContainer from "@/components/documentation/grid-container";
import UpdateAlert from "@/components/documentation/update-alert";

const Demo = ({ lang }: PropsWithLang) => {
  const [showTip, setShowTip] = useState<boolean>(false);
  const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
  return (
    <>
      <GridContainer showResizableTip={showTip} resizable="x">
        <div className="px-8 py-10">
          <iframe
            title="responsive demo"
            className="w-full h-96 pointer-events-none"
            src={`${basePath}/examples/responsive`}
          ></iframe>
        </div>
      </GridContainer>
      <UpdateAlert
        alert="drag"
        lang={lang}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      />
    </>
  );
};

export default Demo;
