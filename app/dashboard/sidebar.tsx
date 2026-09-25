import Link from "next/link";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Tasks",
    href: "/tasks",
  },
  {
    label: "Members",
    href: "/members",
  },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-white"
        >
          Flow<span className="text-indigo-400">Desk</span>
        </Link>
      </div>

      {/* Workspace */}
      <div className="border-b border-slate-800 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-xs text-slate-500">
            Workspace
          </p>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-white">
              FlowDesk Team
            </p>

            <span className="text-xs text-slate-500">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              item.href === "/dashboard"
                ? "bg-indigo-500/10 text-indigo-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-400">
            S
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Siska
            </p>

            <p className="truncate text-xs text-slate-500">
              Owner
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}