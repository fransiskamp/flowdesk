"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setError(
        error.message || "Gagal membuat akun.",
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
                  GET STARTED
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                  Bring your team&apos;s work together.
                </h1>

                <p className="mt-6 text-base leading-7 text-slate-400">
                  Create your FlowDesk account and start managing projects,
                  tasks, and collaboration in one organized workspace.
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
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Start organizing your team&apos;s work with FlowDesk.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

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
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Use at least 8 characters.
                  </p>
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
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}