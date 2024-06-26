import "./globals.css";

import { Inter, Quicksand, Fira_Code } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Analytics } from "@vercel/analytics/react";
import { serverEnv } from "@/env/server";
import ThemeColor from "@/components/theme-color";

const monospace = Fira_Code({
  style: ["normal"],
  variable: "--font-monospace",
  subsets: ["latin"]
});

const quicksand = Quicksand({
  weight: ["400", "600"],
  style: ["normal"],
  variable: "--font-quicksand",
  subsets: ["latin"]
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="apple-mobile-web-app-title" content="rocketicons" />
        <meta name="application-name" content="rocketicons" />

        <ThemeColor />
      </head>
      <body
        className={`${inter.variable} ${quicksand.variable} ${monospace.variable} font-inter bg-background has-[.theme-selector.dark]:bg-background-dark`}
      >
        {children}
        <Analytics />
        <GoogleAnalytics gaId={serverEnv.GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  );
}
