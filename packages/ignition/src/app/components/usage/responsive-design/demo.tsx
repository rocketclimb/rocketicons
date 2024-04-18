"use client";
import { useState } from "react";
import { PropsWithLang } from "@/types";
import GridContainer from "@/components/documentation/grid-container";
import UpdateAlert from "@/components/documentation/update-alert";

const Demo = ({ lang }: PropsWithLang) => {
  const [showTip, setShowTip] = useState<boolean>(false);
  return (
    <>
      <GridContainer showResizableTip={showTip} resizable="x">
        <div className="px-8 py-10">
          <iframe
            className="w-full h-96 pointer-events-none"
            src="/examples/responsive"
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
