"use client";
import Logo from "@/components/logo";
import OnError from "./on-error";

const Error = () => (
  <OnError lang="en" error="error_500">
    <Logo
      className="absolute -bottom-[58px] xs:-bottom-16 md:-bottom-[77px] lg:-bottom-14 left-6 xs:left-7 md:left-14 lg:left-24 ml-10 mb-10 h-[70px] xs:h-24 md:h-32 lg:h-40 origin-bottom-left -rotate-[43deg] lg:-rotate-[42deg]"
      noText
      noFlame
    />
    <div className="absolute bottom-0 xs:bottom-1 left-0 size-24 xs:size-28 md:size-40 lg:size-56 ml-5 mb-2 lg:ml-10 lg:mb-10 rounded-full border-2 lg:border-[3px] border-[#333] dark:border-slate-400"></div>
  </OnError>
);

export default Error;
