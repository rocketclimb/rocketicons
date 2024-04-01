type serverSchema = {
  NEXT_PUBLIC_APP_URL: string;
};

export const serverEnv = {
  NEXT_PUBLIC_APP_URL: String(process.env.NEXT_PUBLIC_APP_URL),
} satisfies serverSchema;
