import { About } from "@/components/landing/about";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Workflow } from "@/components/landing/workflow";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <About />
    </main>
  );
}