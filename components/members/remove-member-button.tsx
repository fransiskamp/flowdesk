"use client";

import { useState } from "react";

type RemoveMemberButtonProps = {
  memberId: string;
  memberName: string;
};

export function RemoveMemberButton({
  memberId,
  memberName,
}: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    setError("");
    setIsRemoving(true);

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to remove member.");
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove member.",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
        aria-label={`Manage ${memberName}`}
      >
        <span className="text-lg leading-none">⋯</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isRemoving) {
              setOpen(false);
              setError("");
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Remove member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to remove{" "}
              <span className="font-medium text-slate-200">
                {memberName}
              </span>{" "}
              from this workspace?
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                disabled={isRemoving}
                className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRemoving ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}