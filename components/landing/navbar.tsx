"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

const navItems = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#workflow",
  },
  {
    label: "About",
    href: "#about",
  },
];

export function Navbar() {
  function handleScroll(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    const navbarOffset = 100;
    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl md:px-5">
        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-950">
            <CheckCircle2
              className="size-4"
              strokeWidth={2.5}
            />
          </div>

          <span className="text-sm font-semibold tracking-tight text-white">
            FlowDesk
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) =>
                handleScroll(event, item.href)
              }
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Get started
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}