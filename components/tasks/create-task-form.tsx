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

type CreateTaskFormProps = {
  projectId: string;
  members: Member[];
  onSuccess?: () => void;
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

export function CreateTaskForm({
  projectId,
  members,
  onSuccess,
}: CreateTaskFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

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
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
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
          data.error ?? "Failed to create task.",
        );
      }

      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setAssigneeId("");
      setDueDate("");

      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create task.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="create-task-title"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Title
          </label>

          <input
            id="create-task-title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Implement authentication"
            disabled={isSaving}
            required
            autoFocus
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="create-task-description"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Description
          </label>

          <textarea
            id="create-task-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe what needs to be done..."
            rows={4}
            disabled={isSaving}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Status + Priority */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="create-task-status"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Status
            </label>

            <select
              id="create-task-status"
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
              htmlFor="create-task-priority"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Priority
            </label>

            <select
              id="create-task-priority"
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
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="create-task-assignee"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Assignee
            </label>

            <select
              id="create-task-assignee"
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
              htmlFor="create-task-due-date"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Due Date
            </label>

            <input
              id="create-task-due-date"
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

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={onSuccess}
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
            {isSaving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </form>
  );
}