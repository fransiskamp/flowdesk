import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { DashboardPreview } from "./dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-36 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/20 to-blue-500/15 blur-[120px]" />

      <div className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[260px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-1.5 text-xs font-medium text-slate-300 shadow-lg shadow-indigo-950/10 backdrop-blur-sm">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" />
          </span>

          Built for teams that want to keep moving
        </div>

        {/* Heading */}
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
          Your team has work to do.
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
            FlowDesk keeps it moving.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-slate-400 sm:text-lg">
          Projects, tasks, people, and progress, all in one place.
          Spend less time searching through scattered tools and more
          time getting things done.
        </p>

        {/* CTA */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 sm:w-auto"
          >
            Get started
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="#workflow"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-6 text-sm font-medium text-slate-300 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white sm:w-auto"
          >
            <span className="flex size-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
              <Play className="ml-0.5 size-3 fill-current" />
            </span>

            See how it works
          </Link>
        </div>

        {/* Small reassurance */}
        <p className="mt-5 text-xs text-slate-600">
          Simple workspace. Clear responsibilities. Less back-and-forth.
        </p>
      </div>

      {/* Dashboard Preview */}
      <div className="relative mt-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[90px]" />

        <DashboardPreview />
      </div>
    </section>
  );
}