import React from "react";

import { withLocale } from "@/locales/with-locale";
import { PropsWithClassNameAndLang } from "@/types";

import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";
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
      <p className="text-primary-darken w-full text-center text-xs italic md:text-[0.83rem] dark:text-primary-dark">
        {(alert === "hover" || alert === "drag") && (
          <PublicJSONIcon
            collection="tb"
            iconId="tb-hand-move"
            className="icon-secondary-sm mr-1"
          />
        )}
        {message[`${alert}-alert`]}
      </p>
    </div>
  );
};

export default UpdateAlert;
