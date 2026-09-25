import {
CheckCircle2,
LayoutDashboard,
UsersRound,
} from "lucide-react";

const features = [
{
icon: LayoutDashboard,
title: "See the bigger picture",
description:
"Keep projects, tasks, and progress in one place so you always know what is happening across the team.",
},
{
icon: CheckCircle2,
title: "Turn plans into progress",
description:
"Break projects into clear tasks, assign responsibilities, and move work forward without the back-and-forth.",
},
{
icon: UsersRound,
title: "Keep everyone in sync",
description:
"Give your team a shared view of what needs attention, what is in progress, and what is already done.",
},
];

export function Features() {
return ( <section
   id="features"
   className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8"
 > <div className="mx-auto max-w-6xl">
{/* Section heading */} <div className="max-w-2xl"> <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
Everything in one place </p>

      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Less searching.
        <br />
        More getting things done.
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
        FlowDesk brings the everyday pieces of team work together,
        so your team can spend less time figuring things out and
        more time moving projects forward.
      </p>
    </div>

    {/* Feature cards */}
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <div
            key={feature.title}
            className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]"
          >
            <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
              <Icon className="size-5 text-indigo-300" />
            </div>

            <h3 className="mt-7 text-base font-semibold text-white">
              {feature.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {feature.description}
            </p>

            <div className="mt-6 h-px w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-12" />
          </div>
        );
      })}
    </div>
  </div>
</section>
);
}