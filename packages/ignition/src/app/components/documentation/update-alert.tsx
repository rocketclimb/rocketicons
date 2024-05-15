import React from "react";
import { TbHandMove } from "rocketicons/tb";
import { withLocale } from "@/locales/with-locale";
import { PropsWithClassNameAndLang } from "@/types";

type UpdateAlertProps = {
  alert: "hover" | "dark-mode" | "changes" | "drag";
} & PropsWithClassNameAndLang &
  React.HTMLAttributes<HTMLElement>;

const UpdateAlert = ({ lang, alert, className, ...props }: UpdateAlertProps) => {
  const locale = withLocale(lang);
  const message = locale.config("update-alert");

  return (
    <div
      className={`group/alert space-x-2 my-3 w-full ${className ?? ""} ${
        (props.onMouseEnter && "cursor-alias") || "cursor-default"
      }`}
      {...props}
    >
      <p className="text-slate-700 w-full text-center text-xs italic md:text-[0.83rem] dark:text-slate-200">
        {(alert === "hover" || alert === "drag") && <TbHandMove className="icon-sky-sm mr-1" />}
        {message[`${alert}-alert`]}
      </p>
    </div>
  );
};

export default UpdateAlert;
