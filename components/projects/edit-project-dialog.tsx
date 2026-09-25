"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

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

type EditProjectDialogProps = {
  project: Project;
  open: boolean;
  onClose: () => void;
};

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  disabled?: boolean;
  placeholder?: string;
};

const WEEKDAYS = [
  "Su",
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
];

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateValue(
  year: number,
  month: number,
  day: number,
) {
  return `${year}-${padNumber(month + 1)}-${padNumber(day)}`;
}

function parseDateValue(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return {
    year,
    month: month - 1,
    day,
  };
}

function compareDateStrings(
  first: string,
  second: string,
) {
  if (first < second) {
    return -1;
  }

  if (first > second) {
    return 1;
  }

  return 0;
}

function toDateInputValue(
  value: Date | string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

function formatDisplayDate(value: string) {
  const parsed = parseDateValue(value);

  if (!parsed) {
    return "";
  }

  return new Date(
    parsed.year,
    parsed.month,
    parsed.day,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CustomDatePicker({
  value,
  onChange,
  minDate,
  disabled = false,
  placeholder = "Select date",
}: DatePickerProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const selectedDate = parseDateValue(value);
  const minimumDate = parseDateValue(
    minDate ?? "",
  );

  const [open, setOpen] = useState(false);

  const [calendarYear, setCalendarYear] =
    useState(
      selectedDate?.year ??
        minimumDate?.year ??
        new Date().getFullYear(),
    );

  const [calendarMonth, setCalendarMonth] =
    useState(
      selectedDate?.month ??
        minimumDate?.month ??
        new Date().getMonth(),
    );

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const monthLabel = useMemo(() => {
    return new Date(
      calendarYear,
      calendarMonth,
      1,
    ).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [calendarYear, calendarMonth]);

  const daysInMonth = new Date(
    calendarYear,
    calendarMonth + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    calendarYear,
    calendarMonth,
    1,
  ).getDay();

  const previousMonthDays = new Date(
    calendarYear,
    calendarMonth,
    0,
  ).getDate();

  const calendarDays: {
    day: number;
    type: "previous" | "current" | "next";
  }[] = [];

  for (
    let index = 0;
    index < firstDayOfMonth;
    index++
  ) {
    calendarDays.push({
      day:
        previousMonthDays -
        firstDayOfMonth +
        index +
        1,
      type: "previous",
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push({
      day,
      type: "current",
    });
  }

  const remainingDays =
    42 - calendarDays.length;

  for (
    let day = 1;
    day <= remainingDays;
    day++
  ) {
    calendarDays.push({
      day,
      type: "next",
    });
  }

  const goToPreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(
        (currentYear) => currentYear - 1,
      );
      return;
    }

    setCalendarMonth(
      (currentMonth) => currentMonth - 1,
    );
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(
        (currentYear) => currentYear + 1,
      );
      return;
    }

    setCalendarMonth(
      (currentMonth) => currentMonth + 1,
    );
  };

  const handleDayClick = (
    day: number,
    type:
      | "previous"
      | "current"
      | "next",
  ) => {
    let targetYear = calendarYear;
    let targetMonth = calendarMonth;

    if (type === "previous") {
      if (calendarMonth === 0) {
        targetYear -= 1;
        targetMonth = 11;
      } else {
        targetMonth -= 1;
      }
    }

    if (type === "next") {
      if (calendarMonth === 11) {
        targetYear += 1;
        targetMonth = 0;
      } else {
        targetMonth += 1;
      }
    }

    const dateValue = formatDateValue(
      targetYear,
      targetMonth,
      day,
    );

    if (
      minDate &&
      compareDateStrings(
        dateValue,
        minDate,
      ) < 0
    ) {
      return;
    }

    onChange(dateValue);

    setCalendarYear(targetYear);
    setCalendarMonth(targetMonth);
    setOpen(false);
  };

  const today = new Date();

  const todayValue = formatDateValue(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!open) {
            const parsed =
              parseDateValue(value);

            if (parsed) {
              setCalendarYear(parsed.year);
              setCalendarMonth(parsed.month);
            } else if (minimumDate) {
              setCalendarYear(
                minimumDate.year,
              );
              setCalendarMonth(
                minimumDate.month,
              );
            }
          }

          setOpen((current) => !current);
        }}
        className={`flex w-full items-center justify-between rounded-xl border bg-slate-950 px-4 py-3 text-left transition ${
          open
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border-slate-700 hover:border-slate-600"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-slate-500"
          >
            <rect
              width="18"
              height="18"
              x="3"
              y="4"
              rx="2"
            />

            <line
              x1="16"
              x2="16"
              y1="2"
              y2="6"
            />

            <line
              x1="8"
              x2="8"
              y1="2"
              y2="6"
            />

            <line
              x1="3"
              x2="21"
              y1="10"
              y2="10"
            />
          </svg>

          <span
            className={
              value
                ? "text-sm text-white"
                : "text-sm text-slate-600"
            }
          >
            {value
              ? formatDisplayDate(value)
              : placeholder}
          </span>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/40">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Previous month"
            >
              ‹
            </button>

            <p className="text-sm font-semibold text-white">
              {monthLabel}
            </p>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="py-2 text-center text-[11px] font-medium uppercase text-slate-600"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(
              ({ day, type }, index) => {
                let targetYear = calendarYear;
                let targetMonth = calendarMonth;

                if (type === "previous") {
                  if (calendarMonth === 0) {
                    targetYear -= 1;
                    targetMonth = 11;
                  } else {
                    targetMonth -= 1;
                  }
                }

                if (type === "next") {
                  if (calendarMonth === 11) {
                    targetYear += 1;
                    targetMonth = 0;
                  } else {
                    targetMonth += 1;
                  }
                }

                const dateValue =
                  formatDateValue(
                    targetYear,
                    targetMonth,
                    day,
                  );

                const isSelected =
                  value === dateValue;

                const isToday =
                  todayValue === dateValue;

                const isBeforeMinimum =
                  minDate
                    ? compareDateStrings(
                        dateValue,
                        minDate,
                      ) < 0
                    : false;

                const isOutsideMonth =
                  type !== "current";

                return (
                  <button
                    key={`${dateValue}-${index}`}
                    type="button"
                    disabled={isBeforeMinimum}
                    onClick={() =>
                      handleDayClick(
                        day,
                        type,
                      )
                    }
                    className={`flex h-9 w-full items-center justify-center rounded-lg text-sm transition ${
                      isSelected
                        ? "bg-indigo-500 font-semibold text-white"
                        : isToday
                          ? "border border-indigo-500/40 text-indigo-300"
                          : isOutsideMonth
                            ? "text-slate-700"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    } ${
                      isBeforeMinimum
                        ? "cursor-not-allowed opacity-25"
                        : ""
                    }`}
                  >
                    {day}
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => {
                const todayDate = new Date();

                const dateValue =
                  formatDateValue(
                    todayDate.getFullYear(),
                    todayDate.getMonth(),
                    todayDate.getDate(),
                  );

                if (
                  minDate &&
                  compareDateStrings(
                    dateValue,
                    minDate,
                  ) < 0
                ) {
                  return;
                }

                onChange(dateValue);

                setCalendarYear(
                  todayDate.getFullYear(),
                );

                setCalendarMonth(
                  todayDate.getMonth(),
                );

                setOpen(false);
              }}
              className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-medium text-slate-500 transition hover:text-red-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function EditProjectDialog({
  project,
  open,
  onClose,
}: EditProjectDialogProps) {
  const router = useRouter();

  const [name, setName] = useState(
    project.name,
  );

  const [description, setDescription] =
    useState(project.description ?? "");

  const [status, setStatus] = useState(
    project.status,
  );

  const [priority, setPriority] = useState(
    project.priority,
  );

  const [startDate, setStartDate] =
    useState(
      toDateInputValue(project.startDate),
    );

  const [dueDate, setDueDate] =
    useState(
      toDateInputValue(project.dueDate),
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  const handleStartDateChange = (
    value: string,
  ) => {
    setStartDate(value);

    if (
      value &&
      dueDate &&
      compareDateStrings(
        value,
        dueDate,
      ) > 0
    ) {
      setDueDate("");
    }

    setError("");
  };

  const handleDueDateChange = (
    value: string,
  ) => {
    setDueDate(value);
    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (
      startDate &&
      dueDate &&
      compareDateStrings(
        startDate,
        dueDate,
      ) > 0
    ) {
      setError(
        "Due date must be after the start date.",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/projects/${project.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            status,
            priority,
            startDate,
            dueDate,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update project.",
        );
      }

      onClose();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <div className="flex shrink-0 items-start justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Edit Project
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Update your project details.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div className="space-y-5 px-6 py-6">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="edit-project-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Project Name
                </label>

                <input
                  id="edit-project-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-description"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Description
                </label>

                <textarea
                  id="edit-project-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="What is this project about?"
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-project-status"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Status
                  </label>

                  <select
                    id="edit-project-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as Project["status"],
                      )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="PLANNING">
                      Planning
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="COMPLETED">
                      Completed
                    </option>

                    <option value="ARCHIVED">
                      Archived
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit-project-priority"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Priority
                  </label>

                  <select
                    id="edit-project-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target
                          .value as Project["priority"],
                      )
                    }
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Start Date
                  </label>

                  <CustomDatePicker
                    value={startDate}
                    onChange={
                      handleStartDateChange
                    }
                    disabled={isSubmitting}
                    placeholder="Select start date"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Due Date
                  </label>

                  <CustomDatePicker
                    value={dueDate}
                    onChange={
                      handleDueDateChange
                    }
                    minDate={startDate}
                    disabled={isSubmitting}
                    placeholder="Select due date"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}