"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

type Member = {
  id: string;
  name: string;
  email: string;
};

type EditTaskFormProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    projectId: string;
    assigneeId: string | null;
  };
  members: Member[];
};

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
] as const;

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const;

export function EditTaskForm({
  task,
  members,
}: EditTaskFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description ?? "",
  );
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(
    task.priority,
  );
  const [assigneeId, setAssigneeId] = useState(
    task.assigneeId ?? "",
  );
  const [dueDate, setDueDate] = useState(task.dueDate);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          assigneeId,
          dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to update task.",
        );
      }

      router.push(`/tasks/${task.id}`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
        {/* Basic Information */}
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="font-semibold text-white">
            Task Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the basic information for this task.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Title
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Implement authentication"
              disabled={isSaving}
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe what needs to be done..."
              rows={5}
              disabled={isSaving}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <p className="mt-2 text-xs text-slate-600">
              Keep the description clear so team members understand
              the expected outcome.
            </p>
          </div>

          {/* Status + Priority */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="task-status"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Status
              </label>

              <select
                id="task-status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as TaskStatus,
                  )
                }
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Priority
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as TaskPriority,
                  )
                }
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {priorityOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="task-assignee"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Assignee
              </label>

              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(event) =>
                  setAssigneeId(event.target.value)
                }
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Unassigned</option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name} — {member.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-due-date"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Due Date
              </label>

              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push(`/tasks/${task.id}`)}
            disabled={isSaving}
            className="rounded-xl border border-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}