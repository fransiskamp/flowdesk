"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({
  projectId,
  projectName,
}: DeleteProjectButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/projects/${projectId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete project.",
        );
      }

      setOpen(false);

      router.push("/projects");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>

        Delete Project
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={() => {
            if (!isDeleting) {
              setOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              Delete Project?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-200">
                {projectName}
              </span>
              ? This will also permanently
              delete all tasks inside this project.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}