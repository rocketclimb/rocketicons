import React from "react";
import { TbHandMove } from "rocketicons/tb";
import { useLocale } from "@/locales/use-locale";
import { PropsWithLang } from "@/types";

type UpdateAlertProps = {
  alert: "hover" | "dark-mode" | "changes" | "drag";
} & PropsWithLang &
  React.HTMLAttributes<HTMLElement>;

const UpdateAlert = ({ lang, alert, ...props }: UpdateAlertProps) => {
  const locale = useLocale(lang);
  const message = locale.config("update-alert");

  return (
    <div
      className="group/alert space-x-2 my-3 cursor-pointer w-full"
      {...props}
    >
      <p className="text-slate-700 w-full text-center text-sm italic font-medium dark:text-slate-200">
        {(alert === "hover" || alert === "drag") && (
          <TbHandMove className="icon-sky-sm mr-1" />
        )}
        {message[`${alert}-alert`]}
      </p>
    </div>
  );
};

export default UpdateAlert;
