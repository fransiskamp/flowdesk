import {
  ArrowUpRight,
  Check,
  Circle,
  Clock3,
  MoreHorizontal,
  Plus,
} from "lucide-react";

const tasks = [
  {
    title: "Authentication flow",
    status: "In progress",
    statusClass: "bg-blue-500/10 text-blue-300",
    icon: Clock3,
  },
  {
    title: "Database schema",
    status: "Completed",
    statusClass: "bg-emerald-500/10 text-emerald-300",
    icon: Check,
  },
  {
    title: "Dashboard design",
    status: "Review",
    statusClass: "bg-violet-500/10 text-violet-300",
    icon: Circle,
  },
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-5xl">
      <div className="absolute -inset-8 -z-10 bg-violet-500/10 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40">
        {/* Browser header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-700" />
            <span className="size-2.5 rounded-full bg-slate-700" />
            <span className="size-2.5 rounded-full bg-slate-700" />
          </div>

          <div className="hidden rounded-md bg-white/5 px-20 py-1.5 text-[10px] text-slate-500 sm:block">
            app.flowdesk.local
          </div>

          <MoreHorizontal className="size-4 text-slate-600" />
        </div>

        <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[180px_1fr]">
          {/* Sidebar */}
          <aside className="hidden border-r border-white/10 bg-slate-950/50 p-4 md:block">
            <div className="mb-7 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-white text-slate-950">
                <Check className="size-3.5" strokeWidth={3} />
              </div>

              <span className="text-xs font-semibold text-white">
                FlowDesk
              </span>
            </div>

            <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Workspace
            </p>

            <div className="space-y-1">
              {["Overview", "Projects", "Tasks", "Team"].map((item, index) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 text-xs ${
                    index === 0
                      ? "bg-white/10 text-white"
                      : "text-slate-500"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="mb-3 mt-8 text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Projects
            </p>

            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-blue-400" />
                Website Redesign
              </div>

              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-violet-400" />
                Mobile App
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="p-5 md:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-500">
                  Monday, September 28
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-tight text-white">
                  Good morning, Siska.
                </h3>
              </div>

              <button className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-slate-400">
                <Plus className="size-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["8", "Projects"],
                ["24", "Active tasks"],
                ["76%", "Completed"],
                ["3", "Overdue"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-lg font-semibold text-white">{value}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white">
                    Website Redesign
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Project progress
                  </p>
                </div>

                <span className="text-xs font-semibold text-white">82%</span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" />
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-white">Recent tasks</p>

                <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white">
                  View all
                  <ArrowUpRight className="size-3" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => {
                  const Icon = task.icon;

                  return (
                    <div
                      key={task.title}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Icon className="size-3.5 shrink-0 text-slate-500" />

                        <span className="truncate text-[11px] text-slate-300">
                          {task.title}
                        </span>
                      </div>

                      <span
                        className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[9px] ${task.statusClass}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}