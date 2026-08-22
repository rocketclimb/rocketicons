type serverSchema = {
  GOOGLE_ANALYTICS_ID: string | undefined;
  SKIP_BUILD_STATIC_GENERATION: boolean;
  NEXT_PUBLIC_PLAYGROUND_URL: string | undefined;
};

export const serverEnv = {
  GOOGLE_ANALYTICS_ID: process.env.NEXT_GOOGLE_ANALYTICS_ID,
  SKIP_BUILD_STATIC_GENERATION: process.env.SKIP_BUILD_STATIC_GENERATION === "true",
  NEXT_PUBLIC_PLAYGROUND_URL: process.env.NEXT_PUBLIC_PLAYGROUND_URL
} satisfies serverSchema;
