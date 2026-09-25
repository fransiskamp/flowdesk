"use client";

import { useState } from "react";

import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <span className="text-base leading-none">
          +
        </span>

        New Project
      </button>

      <CreateProjectDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}