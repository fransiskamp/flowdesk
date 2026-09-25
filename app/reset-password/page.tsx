"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");
    const resetError = searchParams.get("error");

    if (resetToken) {
      setToken(resetToken);
    }

    if (resetError) {
      setError(
        "The password reset link is invalid or has expired.",
      );
    }
  }, [searchParams]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or has expired.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      setError(
        error.message ||
          "Failed to reset your password.",
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
                  SECURITY
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
                  Create a new password.
                </h1>

                <p className="mt-6 text-base leading-7 text-slate-400">
                  Choose a new password to secure your
                  FlowDesk account.
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
              {success ? (
                <>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                    Password updated
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your password has been changed
                    successfully. You can now sign in
                    with your new password.
                  </p>

                  <Link
                    href="/login"
                    className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Back to sign in
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <Link
                      href="/login"
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      ← Back to sign in
                    </Link>

                    <h2 className="mt-8 text-3xl font-semibold tracking-tight text-slate-950">
                      Reset your password
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Enter a new password for your
                      FlowDesk account.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        New password
                      </label>

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Create a new password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Confirm new password
                      </label>

                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value,
                          )
                        }
                        placeholder="Repeat your new password"
                        autoComplete="new-password"
                        required
                        minLength={8}
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
                      disabled={loading || !token}
                      className="h-12 w-full rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading
                        ? "Updating password..."
                        : "Update password"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}