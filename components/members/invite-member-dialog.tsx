"use client";

import { useState } from "react";

type InviteMemberDialogProps = {
  workspaceId: string;
};

export function InviteMemberDialog({
  workspaceId,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setRole("MEMBER");
    setError("");
  }

  function closeDialog() {
    if (isSubmitting) return;

    setOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
          workspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to invite member.");
      }

      setOpen(false);
      resetForm();

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to invite member.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
      >
        <span className="text-lg leading-none">+</span>
        Invite Member
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Invite Member
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add a new member to your workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="member-name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Name
                </label>

                <input
                  id="member-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Dimas Pratama"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="member-email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email
                </label>

                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e.g. dimas@flowdesk.dev"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="member-role"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Role
                </label>

                <select
                  id="member-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Inviting..." : "Invite Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}