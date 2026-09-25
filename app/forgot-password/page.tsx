"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } =
      await authClient.requestPasswordReset({
        email,
        redirectTo:
          `${window.location.origin}/reset-password`,
      });

    if (error) {
      setError(
        error.message ||
          "Gagal mengirim link reset password.",
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
                  ACCOUNT RECOVERY
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                  Get back into your workspace.
                </h1>

                <p className="mt-6 text-base leading-7 text-slate-400">
                  Reset your password securely and
                  continue managing your projects and
                  tasks in FlowDesk.
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
                  href="/login"
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  ← Back to sign in
                </Link>

                <h2 className="mt-8 text-3xl font-semibold tracking-tight text-slate-950">
                  Forgot password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your email and we&apos;ll send you
                  a link to reset your password.
                </p>
              </div>

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-sm font-semibold text-emerald-900">
                    Check your email
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    If an account exists for{" "}
                    <span className="font-medium">
                      {email}
                    </span>
                    , you&apos;ll receive a password reset
                    link shortly.
                  </p>

                  <Link
                    href="/login"
                    className="mt-5 inline-flex text-sm font-semibold text-emerald-900 hover:underline"
                  >
                    Back to sign in
                  </Link>
                </div>
              ) : (
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
                    {loading
                      ? "Sending link..."
                      : "Send reset link"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}