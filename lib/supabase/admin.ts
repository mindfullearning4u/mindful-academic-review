import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv, getRequiredEnv } from "@/lib/env";

export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();

  return createSupabaseClient(url, getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
