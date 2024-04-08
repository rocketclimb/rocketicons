type serverSchema = {
  NEXT_PUBLIC_APP_URL: string;
  GOOGLE_ANALYTICS_ID: string;
};

export const serverEnv = {
  NEXT_PUBLIC_APP_URL: String(process.env.NEXT_PUBLIC_APP_URL),
  GOOGLE_ANALYTICS_ID: String(process.env.NEXT_GOOGLE_ANALYTICS_ID),
} satisfies serverSchema;
