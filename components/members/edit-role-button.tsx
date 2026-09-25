"use client";

import { useState } from "react";

type EditRoleButtonProps = {
  memberId: string;
  memberName: string;
  currentRole: "ADMIN" | "MEMBER";
};

export function EditRoleButton({
  memberId,
  memberName,
  currentRole,
}: EditRoleButtonProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(currentRole);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function closeDialog() {
    if (isSaving) return;

    setOpen(false);
    setRole(currentRole);
    setError("");
  }

  async function handleSave() {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update member role.");
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update member role.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
      >
        Edit Role
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              closeDialog();
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              Edit Member Role
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Change the workspace role for{" "}
              <span className="font-medium text-slate-200">
                {memberName}
              </span>
              .
            </p>

            <div className="mt-6">
              <label
                htmlFor={`role-${memberId}`}
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Role
              </label>

              <select
                id={`role-${memberId}`}
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "ADMIN" | "MEMBER")
                }
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isSaving}
                className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || role === currentRole}
                className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}