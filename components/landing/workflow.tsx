import {
ArrowRight,
FolderKanban,
ListChecks,
UsersRound,
} from "lucide-react";

const steps = [
{
number: "01",
icon: FolderKanban,
title: "Start with a project",
description:
"Create a dedicated space for your work and give everyone a clear place to start.",
},
{
number: "02",
icon: ListChecks,
title: "Break work into tasks",
description:
"Turn ideas into actionable tasks, assign responsibilities, and keep progress visible.",
},
{
number: "03",
icon: UsersRound,
title: "Move forward together",
description:
"See what is done, what needs attention, and what your team should focus on next.",
},
];

export function Workflow() {
return ( <section
   id="workflow"
   className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8"
 > <div className="mx-auto max-w-6xl">
{/* Section heading */} <div className="max-w-2xl"> <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
How it works </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        From “what are we doing?”
        <br />
        to “here’s what’s next.”
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
        A simple workflow that keeps your team moving without adding
        another complicated process to manage.
      </p>
    </div>

    {/* Steps */}
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <div key={step.number} className="relative">
            <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-[0.15em] text-slate-600">
                  {step.number}
                </span>

                <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                  <Icon className="size-5 text-indigo-300" />
                </div>
              </div>

              <h3 className="mt-8 text-base font-semibold text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.description}
              </p>

              <div className="mt-6 h-px w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-12" />
            </div>

            {index < steps.length - 1 && (
              <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-slate-700 md:block" />
            )}
          </div>
        );
      })}
    </div>
  </div>
</section>
);
}
