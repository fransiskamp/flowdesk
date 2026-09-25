"use client";

import { useState } from "react";

import { CreateTaskForm } from "@/components/tasks/create-task-form";

type Member = {
  id: string;
  name: string;
  email: string;
};

type CreateTaskDialogProps = {
  projectId: string;
  members: Member[];
};

export function CreateTaskDialog({
  projectId,
  members,
}: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
      >
        <span className="text-lg leading-none">+</span>
        Add Task
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create New Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new task to this project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <CreateTaskForm
                projectId={projectId}
                members={members}
                onSuccess={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}