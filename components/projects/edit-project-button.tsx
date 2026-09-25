"use client";

import { useState } from "react";

import { EditProjectDialog } from "@/components/projects/edit-project-dialog";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status:
    | "PLANNING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  startDate: Date | string | null;
  dueDate: Date | string | null;
};

type EditProjectButtonProps = {
  project: Project;
};

export function EditProjectButton({
  project,
}: EditProjectButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>

        Edit Project
      </button>

      <EditProjectDialog
        project={project}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}