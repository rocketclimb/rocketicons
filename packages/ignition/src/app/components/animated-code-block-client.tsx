"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr:false must be in a client component (Next.js 15 requirement).
// This prevents the code-block package's element2Array from running on the server
// where it crashes processing rocketicons' SVG element tree.
const HomeCodePreviewInner = dynamic(() => import("@/components/home-code-preview"), {
  ssr: false
});

const HomeCodePreviewLoader = () => <HomeCodePreviewInner />;

export default HomeCodePreviewLoader;
