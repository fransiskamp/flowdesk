"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(
        error.message || "Email atau password tidak valid.",
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-2">
          {/* Left Side */}
          <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-950">
                  F
                </span>
                FlowDesk
              </Link>

              <div className="mt-20 max-w-md">
                <p className="text-sm font-medium text-slate-400">
                  WORKSPACE MANAGEMENT
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                  Everything your team needs, in one workspace.
                </h1>

                <p className="mt-6 text-base leading-7 text-slate-400">
                  Manage projects, organize tasks, and keep your team aligned
                  without jumping between different tools.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 FlowDesk
            </p>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <Link
                  href="/"
                  className="inline-block text-sm font-medium text-slate-500 transition hover:text-slate-900 lg:hidden"
                >
                  ← Back to FlowDesk
                </Link>

                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your workspace.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                disabled
                className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-400"
              >
                Continue with Google
              </button>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}

                <Link
                  href="/register"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}