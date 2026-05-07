export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPublicSupabaseEnv() {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getPublicAppUrl() {
  return getRequiredEnv("NEXT_PUBLIC_APP_URL").replace(/\/+$/, "");
}

export function getAuthRedirectUrl(path = "/dashboard") {
  return new URL(path, `${getPublicAppUrl()}/`).toString();
}
