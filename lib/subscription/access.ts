import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionAccess = {
  hasAccess: boolean;
  subscriptionTier: "basic" | "premium" | "graduate_research";
  subscriptionStatus: string;
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

type ProfileAccessRow = {
  subscription_tier: "basic" | "premium" | "graduate_research";
  subscription_status: string;
};

export async function getSubscriptionAccess(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<SubscriptionAccess> {
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_tier, subscription_status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      hasAccess: false,
      subscriptionTier: "basic",
      subscriptionStatus: "error",
    };
  }

  const profile = data as ProfileAccessRow | null;

  if (profile) {
    return {
      hasAccess: ACTIVE_STATUSES.has(profile.subscription_status),
      subscriptionTier: profile.subscription_tier,
      subscriptionStatus: profile.subscription_status,
    };
  }

  const { data: insertedProfile } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      subscription_tier: "premium",
      subscription_status: "active",
    })
    .select("subscription_tier, subscription_status")
    .single();

  const fallbackProfile = insertedProfile as ProfileAccessRow | null;

  return {
    hasAccess: Boolean(fallbackProfile),
    subscriptionTier: fallbackProfile?.subscription_tier ?? "premium",
    subscriptionStatus: fallbackProfile?.subscription_status ?? "active",
  };
}
