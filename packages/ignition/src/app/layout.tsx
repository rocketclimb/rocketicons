import "./globals.css";

import { Inter, Quicksand, Fira_Code } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import { serverEnv } from "@/env/server";
import ThemeColor from "@/components/theme-color";
import { withSiteBasePath } from "@/config/site-origin";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={withSiteBasePath("/apple-touch-icon.png")}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={withSiteBasePath("/favicon-32x32.png")}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={withSiteBasePath("/favicon-16x16.png")}
        />
        <link rel="manifest" href={withSiteBasePath("/site.webmanifest")} />
        <link rel="mask-icon" href={withSiteBasePath("/safari-pinned-tab.svg")} color="#5bbad5" />
        <meta name="apple-mobile-web-app-title" content="rocketicons" />
        <meta name="application-name" content="rocketicons" />
        <link
          rel="alternate"
          type="text/plain"
          href={withSiteBasePath("/llms.txt")}
          title="Rocketicons for LLMs"
        />

        {/* Inline script to prevent FOUC — sets dark class on <html> before React hydrates.
            Uses the same localStorage key ("theme-prefs") as useThemeHandler hook.
            Default: dark (matching production failBack). System pref respected when pref is "system". */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('theme-prefs');
                  var pref = raw ? JSON.parse(raw) : null;
                  var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = pref === 'light' ? false : (pref === 'system' ? sysDark : true);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `
          }}
        />

        <ThemeColor />
      </head>
      <body
        className={`${inter.variable} ${quicksand.variable} ${monospace.variable} font-inter bg-background dark:bg-background-dark`}
      >
        {children}
        {serverEnv.GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={serverEnv.GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
