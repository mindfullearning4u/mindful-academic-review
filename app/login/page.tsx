import { redirect } from "next/navigation";

import { signIn, signUp } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f2eee6] px-5 py-10 text-[#232b28] sm:px-8">
      <section className="mx-auto max-w-md rounded-2xl border border-[#ddd4c6]/80 bg-[#fffaf2] p-7 shadow-[0_10px_28px_rgba(43,38,30,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c6bba9] bg-[#203b37] text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#fff8ea]">
            MAR
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#685d48]">
            Academic Review Workspace
          </p>
        </div>

        <h1 className="mt-7 text-2xl font-semibold tracking-tight text-[#17211f]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#56625e]">
          Access your saved assignment templates and generate instructor
          feedback securely.
        </p>

        {message ? (
          <p className="mt-5 rounded-xl border border-[#d2bbb1] bg-[#fbf0eb] px-4 py-3 text-sm text-[#7a3327]">
            {message}
          </p>
        ) : null}

        <form className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-[#394541]">
            Email
            <input
              className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
              name="email"
              required
              type="email"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#394541]">
            Password
            <input
              className="rounded-xl border border-[#d8cebd] bg-[#fffdf7] px-3.5 py-2.5 text-base text-[#232b28] outline-none transition duration-200 focus:border-[#28433f] focus:ring-2 focus:ring-[#28433f]/15"
              minLength={6}
              name="password"
              required
              type="password"
            />
          </label>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <button
              className="rounded-xl bg-[#23413d] px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-[#2d4a43]"
              formAction={signIn}
              type="submit"
            >
              Sign In
            </button>
            <button
              className="rounded-xl border border-[#cfc5b5] bg-[#fffdf7] px-4 py-2.5 text-sm font-semibold text-[#394541] transition duration-200 hover:border-[#a99578] hover:bg-[#f3ecdf]"
              formAction={signUp}
              type="submit"
            >
              Create Account
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
