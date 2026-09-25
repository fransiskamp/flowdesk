"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  assigneeName: string | null;
};

type Column = {
  status: TaskStatus;
  title: string;
  description: string;
  color: string;
  dot: string;
};

type KanbanBoardProps = {
  projectId: string;
  tasks: Task[];
};

const columns: Column[] = [
  {
    status: "TODO",
    title: "To Do",
    description: "Tasks that have not started yet.",
    color: "text-slate-300",
    dot: "bg-slate-400",
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
    description: "Tasks currently being worked on.",
    color: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  {
    status: "IN_REVIEW",
    title: "In Review",
    description: "Tasks waiting for review.",
    color: "text-amber-400",
    dot: "bg-amber-400",
  },
  {
    status: "DONE",
    title: "Done",
    description: "Completed tasks.",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
];

const priorityStyles = {
  LOW: "bg-emerald-500/10 text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-red-500/10 text-red-400",
};

function formatDate(date: string | null) {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TaskCardContent({ task }: { task: Task }) {
  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-medium leading-6 text-white">
          {task.title}
        </h3>

        <span
          className="mt-1 shrink-0 text-slate-600"
          aria-hidden="true"
        >
          ⋮
        </span>
      </div>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {task.description}
        </p>
      )}

      <div className="mt-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-400">
            {task.assigneeName
              ? task.assigneeName.charAt(0).toUpperCase()
              : "?"}
          </div>

          <span className="truncate text-xs text-slate-400">
            {task.assigneeName ?? "Unassigned"}
          </span>
        </div>

        <span className="shrink-0 text-[11px] text-slate-600">
          {formatDate(task.dueDate)}
        </span>
      </div>
    </>
  );
}

function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab touch-none rounded-xl border border-slate-800 bg-slate-950 p-4 transition active:cursor-grabbing ${
        isDragging
          ? "opacity-30"
          : "hover:border-slate-700 hover:bg-slate-900"
      }`}
    >
      <TaskCardContent task={task} />
    </article>
  );
}

function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <article className="cursor-grabbing rounded-xl border border-indigo-500/40 bg-slate-900 p-4 shadow-2xl ring-1 ring-indigo-500/20">
      <TaskCardContent task={task} />
    </article>
  );
}

function KanbanColumn({
  column,
  tasks,
}: {
  column: Column;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[600px] rounded-2xl border p-4 transition ${
        isOver
          ? "border-indigo-500/50 bg-indigo-500/5"
          : "border-slate-800 bg-slate-900/70"
      }`}
    >
      <div className="mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${column.dot}`}
            />

            <h2
              className={`font-semibold ${column.color}`}
            >
              {column.title}
            </h2>
          </div>

          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-800 px-2 text-xs font-semibold text-slate-400">
            {tasks.length}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {column.description}
        </p>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[480px] space-y-3">
          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center">
              <p className="text-xs text-slate-600">
                Drop tasks here
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
}

export function KanbanBoard({
  projectId,
  tasks: initialTasks,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(
    [...initialTasks].sort(
      (a, b) => a.position - b.position,
    ),
  );

  const [activeTask, setActiveTask] =
    useState<Task | null>(null);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const findTask = (taskId: string) => {
    return tasks.find(
      (task) => task.id === taskId,
    );
  };

  const getColumnTasks = (
    status: TaskStatus,
  ) => {
    return tasks
      .filter(
        (task) => task.status === status,
      )
      .sort(
        (a, b) => a.position - b.position,
      );
  };

  const normalizePositions = (
    taskList: Task[],
  ) => {
    return taskList.map((task, index) => ({
      ...task,
      position: index,
    }));
  };

  const getDestinationStatus = (
    overId: string,
  ): TaskStatus | undefined => {
    const column = columns.find(
      (column) => column.status === overId,
    );

    if (column) {
      return column.status;
    }

    return findTask(overId)?.status;
  };

  const updateTask = async (task: Task) => {
    const response = await fetch(
      "/api/tasks/status",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: task.id,
          projectId,
          status: task.status,
          position: task.position,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update task: ${task.title}`,
      );
    }
  };

  const saveTasks = async (
    tasksToSave: Task[],
  ) => {
    await Promise.all(
      tasksToSave.map((task) =>
        updateTask(task),
      ),
    );
  };

  const handleDragStart = (
    event: DragStartEvent,
  ) => {
    const task = findTask(
      String(event.active.id),
    );

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (
    event: DragEndEvent,
  ) => {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTaskItem = findTask(activeId);

    if (!activeTaskItem) {
      return;
    }

    const destinationStatus =
      getDestinationStatus(overId);

    if (!destinationStatus) {
      return;
    }

    const previousTasks = [...tasks];

    const sourceStatus =
      activeTaskItem.status;

    const sourceTasks =
      getColumnTasks(sourceStatus);

    const destinationTasks =
      getColumnTasks(destinationStatus);

    /*
     * SAME COLUMN
     */
    if (sourceStatus === destinationStatus) {
      const oldIndex =
        sourceTasks.findIndex(
          (task) => task.id === activeId,
        );

      const newIndex =
        sourceTasks.findIndex(
          (task) => task.id === overId,
        );

      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return;
      }

      const reorderedTasks = arrayMove(
        sourceTasks,
        oldIndex,
        newIndex,
      );

      const normalizedTasks =
        normalizePositions(
          reorderedTasks,
        );

      const updatedTasks =
        tasks.map((task) => {
          const updatedTask =
            normalizedTasks.find(
              (item) =>
                item.id === task.id,
            );

          return updatedTask ?? task;
        });

      setTasks(updatedTasks);
      setIsUpdating(true);

      try {
        await saveTasks(normalizedTasks);
      } catch (error) {
        console.error(
          "Failed to save reordered tasks:",
          error,
        );

        setTasks(previousTasks);
      } finally {
        setIsUpdating(false);
      }

      return;
    }

    /*
     * MOVE BETWEEN COLUMNS
     */
    const sourceWithoutActive =
      sourceTasks.filter(
        (task) => task.id !== activeId,
      );

    const destinationWithoutActive =
      destinationTasks.filter(
        (task) => task.id !== activeId,
      );

    const overTaskIndex =
      destinationWithoutActive.findIndex(
        (task) => task.id === overId,
      );

    const destinationIndex =
      overTaskIndex === -1
        ? destinationWithoutActive.length
        : overTaskIndex;

    const movedTask: Task = {
      ...activeTaskItem,
      status: destinationStatus,
    };

    destinationWithoutActive.splice(
      destinationIndex,
      0,
      movedTask,
    );

    const normalizedSourceTasks =
      normalizePositions(
        sourceWithoutActive,
      );

    const normalizedDestinationTasks =
      normalizePositions(
        destinationWithoutActive,
      );

    const updatedTasks = tasks.map(
      (task) => {
        if (task.id === activeId) {
          const moved =
            normalizedDestinationTasks.find(
              (item) =>
                item.id === activeId,
            );

          return moved ?? task;
        }

        if (task.status === sourceStatus) {
          const updated =
            normalizedSourceTasks.find(
              (item) =>
                item.id === task.id,
            );

          return updated ?? task;
        }

        if (
          task.status ===
          destinationStatus
        ) {
          const updated =
            normalizedDestinationTasks.find(
              (item) =>
                item.id === task.id,
            );

          return updated ?? task;
        }

        return task;
      },
    );

    setTasks(updatedTasks);
    setIsUpdating(true);

    try {
      await saveTasks([
        ...normalizedSourceTasks,
        ...normalizedDestinationTasks,
      ]);
    } catch (error) {
      console.error(
        "Failed to save moved task:",
        error,
      );

      setTasks(previousTasks);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute right-0 top-0 z-10 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 shadow-lg">
          Saving...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid min-w-[1100px] grid-cols-4 gap-5">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={getColumnTasks(
                column.status,
              )}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCardOverlay
              task={activeTask}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <p className="mt-4 text-center text-xs text-slate-600 lg:hidden">
        Swipe horizontally to view the full board.
      </p>
    </div>
  );
}