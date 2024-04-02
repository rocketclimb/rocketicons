import { ImageResponse } from "next/og";
import { Languages } from "@/types";
import { serverEnv } from "@/env/server";
import { useLocale } from "@/locales";

export default async function OpenGraph({
  lang,
  text,
}: {
  lang: Languages;
  text?: string;
}) {
  const { brand } = useLocale(lang || "en").config();

  return new ImageResponse(
    (
      <div
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, #E0E7FF 25%, #ffffff 50%, #CFFAFE 75%)",
        }}
        tw="h-full w-full flex flex-col items-center justify-center bg-white"
      >
        <img
          src={
            serverEnv.NEXT_PUBLIC_APP_URL +
            "/logo-rocketicons-black-nobg-512.png"
          }
          alt="rocketicons Logo"
          tw="w-128 h-23 mb-4 opacity-95"
          width={256}
          height={47}
        />
        <span
          style={{
            fontSize: "40px",
            fontWeight: 900,
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {brand["motto"]}
        </span>
        <>
          {text && (
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                background:
                  "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: "5rem",
                letterSpacing: "-0.02em",
              }}
            >
              {text}
            </span>
          )}
        </>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
