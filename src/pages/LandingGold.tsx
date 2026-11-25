import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck,
  FileText,
  Globe2,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: BookOpen,
    title: 'Learn in one place',
    description: 'Explore courses and keep your learning organized as you go.',
    color: 'text-violet-300',
    bg: 'bg-violet-300/10',
  },
  {
    icon: Brain,
    title: 'Get unstuck',
    description: 'Use the AI tutor to break down questions and explore new ideas.',
    color: 'text-violet-300',
    bg: 'bg-violet-300/10',
  },
  {
    icon: CalendarCheck,
    title: 'Make a realistic plan',
    description: 'Turn bigger goals into clear, manageable study sessions.',
    color: 'text-sky-300',
    bg: 'bg-sky-300/10',
  },
  {
    icon: FileText,
    title: 'Keep useful notes',
    description: 'Capture what matters and find it again when you need it.',
    color: 'text-emerald-300',
    bg: 'bg-emerald-300/10',
  },
  {
    icon: Timer,
    title: 'Focus at your pace',
    description: 'Create a little room to concentrate, pause, and come back.',
    color: 'text-rose-300',
    bg: 'bg-rose-300/10',
  },
  {
    icon: Globe2,
    title: 'Make learning yours',
    description: 'Use accessibility tools and language options that fit you.',
    color: 'text-cyan-300',
    bg: 'bg-cyan-300/10',
  },
];

export default function LandingGold() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090d18] text-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Edumite home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9586f2] text-[#11131b]">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">edumite<span className="text-[#aa9df8]">.</span></span>
        </Link>
        <nav className="flex items-center gap-3">
          <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:text-white sm:inline-flex">
            Explore features
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#9586f2] px-4 py-2.5 text-sm font-semibold text-[#11131b] transition hover:bg-[#aa9df8]"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-48 top-0 h-[34rem] w-[34rem] rounded-full bg-violet-500/[0.08] blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-300">
            <Sparkles className="h-4 w-4 text-[#c4bcff]" />
            A learning space built around you
          </div>
          <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Make learning feel
            <span className="block bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              clear, focused, doable.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Bring your courses, study plans, notes, and focus sessions together—so your next step is always easy to find.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#9586f2] px-5 py-3 font-semibold text-[#11131b] transition hover:-translate-y-0.5 hover:bg-[#aa9df8]"
            >
              Create your learning space <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 font-medium text-slate-200 transition hover:bg-white/[0.07]"
            >
              See what you can do
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2"><CheckMark /> Pick up at your own pace</span>
            <span className="inline-flex items-center gap-2"><CheckMark /> Make your own plan</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div aria-hidden="true" className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 blur-2xl" />
          <div className="relative rounded-3xl border border-white/10 bg-[#111827]/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Your learning space</p>
                  <p className="text-xs text-slate-500">A clear next step, every day</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                Ready when you are
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a2335] to-[#111827] p-5 sm:p-6">
              <p className="text-sm text-slate-400">A simple plan for today</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">One step at a time.</h2>
              <div className="mt-5 space-y-3">
                {[
                  { icon: BookOpen, text: 'Choose something to learn', color: 'text-violet-200', fill: 'bg-violet-200/10' },
                  { icon: Timer, text: 'Set aside a focus session', color: 'text-sky-200', fill: 'bg-sky-200/10' },
                  { icon: FileText, text: 'Keep the ideas that matter', color: 'text-emerald-200', fill: 'bg-emerald-200/10' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-3.5">
                      <span className={`rounded-lg p-2 ${item.fill} ${item.color}`}><Icon className="h-4 w-4" /></span>
                      <span className="text-sm font-medium text-slate-200">{item.text}</span>
                      <span className="ml-auto h-2 w-2 rounded-full bg-white/20" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <Brain className="h-5 w-5 text-violet-300" />
                <p className="mt-3 text-sm font-semibold text-white">Helpful tools</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Tutoring, planning, and more</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <Users className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-sm font-semibold text-white">Room to grow</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Keep your progress together</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-8 border-t border-white/[0.07] bg-[#0c1220] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">Everything in reach</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Tools for the way you learn</h2>
            <p className="mt-4 leading-7 text-slate-400">
              Start with what you need now. Add more to your routine when you are ready.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-white/[0.08] bg-[#111827]/80 p-6 transition hover:-translate-y-1 hover:border-white/15 hover:bg-[#151e30]">
                  <span className={`inline-flex rounded-xl p-3 ${feature.bg} ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl border border-violet-300/15 bg-gradient-to-r from-violet-500/[0.08] to-cyan-500/[0.06] p-6 sm:flex-row sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Ready to make a start?</h2>
              <p className="mt-1 text-sm text-slate-400">Your learning space is only a name away.</p>
            </div>
            <Link to="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#9586f2] px-5 py-2.5 font-semibold text-[#11131b] transition hover:bg-[#aa9df8]">
              Continue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CheckMark() {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-300/10 text-[10px] text-emerald-200">✓</span>;
}
