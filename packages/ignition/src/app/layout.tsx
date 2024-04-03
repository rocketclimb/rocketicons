import "./globals.css";

import { Inter, Quicksand, Fira_Code } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/config/site";

const monospace = Fira_Code({
  weight: ["400"],
  style: ["normal"],
  variable: "--font-monospace",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  weight: ["400", "600"],
  style: ["normal"],
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "React",
    "React Native",
    "Vercel",
    "Tailwind",
    "rocketclimb",
    "rocketicons",
    "icons",
  ],
  authors: [
    {
      name: "RocketClimb",
      url: "https://rocketclimb.com",
    },
  ],
  creator: "RocketClimb",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@rocketclimb",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
  },
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="apple-mobile-web-app-title" content="rocketicons" />
        <meta name="application-name" content="rocketicons" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${inter.variable} ${quicksand.variable} ${monospace.variable} bg-white has-[.theme-selector.dark]:bg-slate-900 has-[.theme-selector.dark]:dark-scrollbar`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
