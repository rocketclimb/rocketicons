/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from "next/og";
import Logo from "../../public/android-chrome-512x512.png";
import { PropsWithLangParams } from "./types";
import { serverEnv } from "@/env/server";
import { useLocale } from "./locales";

export const runtime = "dynamic";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const contentType = "image/png";

export default async function OG({ params: { lang } }: PropsWithLangParams) {
  const [nav] = useLocale(lang).component();

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
          src={serverEnv.NEXT_PUBLIC_APP_URL + Logo.src}
          alt="rocketicons Logo"
          tw="w-20 h-20 mb-4 opacity-95"
          width={80}
          height={80}
        />
        <h1
          style={{
            fontSize: "80px",
            fontWeight: 900,
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          rocketicons
        </h1>
        <h2
          style={{
            fontSize: "40px",
            fontWeight: 700,
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {nav["motto"]}
        </h2>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
