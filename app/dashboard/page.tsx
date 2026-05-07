import { redirect } from "next/navigation";

import { signOut } from "@/app/login/actions";
import DashboardClient from "@/app/dashboard/dashboard-client";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <form className="fixed right-5 top-5 z-10" action={signOut}>
        <button
          className="rounded-xl border border-[#cfc5b5] bg-[#fffdf7]/95 px-4 py-2 text-sm font-semibold text-[#394541] shadow-[0_5px_12px_rgba(32,38,35,0.1)] transition duration-200 hover:border-[#a99578] hover:bg-[#f3ecdf]"
          type="submit"
        >
          Sign Out
        </button>
      </form>
      <DashboardClient />
    </>
  );
}
