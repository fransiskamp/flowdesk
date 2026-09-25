import {
CheckCircle2,
Layers3,
ShieldCheck,
} from "lucide-react";

const highlights = [
{
icon: Layers3,
title: "One connected workspace",
description:
"Projects, tasks, and team activity stay connected, so important updates do not get lost between different tools.",
},
{
icon: CheckCircle2,
title: "Simple enough to use",
description:
"A clean workflow makes it easy to understand what needs to be done without adding unnecessary complexity.",
},
{
icon: ShieldCheck,
title: "Built around your team",
description:
"Keep responsibilities clear, progress visible, and everyone working from the same source of truth.",
},
];

export function About() {
return ( <section
   id="about"
   className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8"
 > <div className="mx-auto max-w-6xl"> <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
{/* Copy */} <div> <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
About FlowDesk </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Work should feel
          <br />
          less scattered.
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
          FlowDesk is a project management workspace built around a
          simple idea: your team should not have to dig through
          different tools just to figure out what is happening.
        </p>

        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
          From the first project idea to the final task, FlowDesk keeps
          the work connected in one place giving teams a clearer view
          of what is happening now and what comes next.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {highlights.map((highlight) => {
          const Icon = highlight.icon;

          return (
            <div
              key={highlight.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                  <Icon className="size-5 text-indigo-300" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {highlight.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    {highlight.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-px w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-12" />
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>
);
}
