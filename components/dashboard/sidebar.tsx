"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

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
    label: "Activity",
    href: "/activity",
  },
  {
    label: "Members",
    href: "/members",
  },
];

type CurrentUser = {
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  workspaceName: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setCurrentUser(data);
      } catch {
        // Ignore request errors.
      }
    }

    loadCurrentUser();
  }, [session?.user]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const userName =
    currentUser?.name ||
    session?.user?.name ||
    "User";

  const userInitial = userName
    .trim()
    .charAt(0)
    .toUpperCase();

  const roleLabel =
    currentUser?.role === "OWNER"
      ? "Owner"
      : currentUser?.role === "ADMIN"
        ? "Admin"
        : currentUser?.role === "MEMBER"
          ? "Member"
          : "Workspace Member";

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

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-400">
            {isPending ? "..." : userInitial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {isPending ? "Loading..." : userName}
            </p>

            <p className="truncate text-xs text-slate-500">
              {roleLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut || isPending}
            className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "..." : "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}