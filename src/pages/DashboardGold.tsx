import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_COURSES } from '@/mocks/courses';
import { useUserStore } from '@/store/userStore';

const quickActions = [
  {
    title: 'Find a course',
    description: 'Explore a topic you want to learn.',
    to: '/courses',
    icon: BookOpen,
    tint: 'from-violet-400/20 to-indigo-400/5',
    iconColor: 'text-violet-300',
  },
  {
    title: 'Ask your tutor',
    description: 'Get help with a tricky concept.',
    to: '/ai-bot',
    icon: Brain,
    tint: 'from-violet-400/20 to-indigo-400/5',
    iconColor: 'text-violet-300',
  },
  {
    title: 'Plan your week',
    description: 'Turn your goals into a study plan.',
    to: '/study-planner',
    icon: CalendarDays,
    tint: 'from-sky-400/20 to-cyan-400/5',
    iconColor: 'text-sky-300',
  },
  {
    title: 'Capture an idea',
    description: 'Save notes while they are fresh.',
    to: '/notes',
    icon: FileText,
    tint: 'from-emerald-400/20 to-teal-400/5',
    iconColor: 'text-emerald-300',
  },
];

const courseAccents = [
  'from-violet-500/25 via-indigo-500/10 to-[#121827]',
  'from-violet-500/25 via-indigo-500/10 to-[#121827]',
  'from-sky-500/25 via-cyan-500/10 to-[#121827]',
];

export default function DashboardGold() {
  const user = useUserStore((state) => state.user);
  const firstName = user?.name.trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const courses = MOCK_COURSES.slice(0, 3);

  const stats = [
    { label: 'Experience points', value: (user?.xp ?? 0).toLocaleString(), detail: 'Earn more as you learn', icon: Sparkles, color: 'text-violet-300' },
    { label: 'Current level', value: String(user?.level ?? 1), detail: 'Every session moves you forward', icon: Trophy, color: 'text-violet-300' },
    { label: 'Study streak', value: `${user?.streak ?? 0} days`, detail: 'Small steps count', icon: Flame, color: 'text-rose-300' },
    { label: 'Your next goal', value: '25 min', detail: 'A focused session is a great start', icon: Target, color: 'text-sky-300' },
  ];

  return (
    <main className="min-h-screen bg-[#090d18] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-violet-500/[0.06] blur-3xl" />
        <div className="absolute -left-48 top-96 h-[30rem] w-[30rem] rounded-full bg-teal-400/[0.05] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="flex flex-col justify-between gap-6 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#182033] via-[#131a29] to-[#171626] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-medium text-slate-400">{today}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting}, <span className="text-violet-200">{firstName}</span>
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-slate-300">
              Welcome to your learning space. Pick one thing you would like to make progress on today.
            </p>
          </div>
          <Link
            to="/focus-room"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#9586f2] px-5 py-3 font-semibold text-[#11131b] transition hover:-translate-y-0.5 hover:bg-[#aa9df8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          >
            <Clock3 className="h-4 w-4" />
            Start a focus session
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section aria-label="Your learning overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="rounded-2xl border border-white/[0.08] bg-[#111827]/85 p-5 transition hover:border-white/15">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                  </div>
                  <span className="rounded-xl bg-white/[0.05] p-2.5">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{stat.detail}</p>
              </article>
            );
          })}
        </section>

        <section aria-labelledby="quick-actions-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">A good place to begin</p>
              <h2 id="quick-actions-title" className="mt-1 text-xl font-semibold tracking-tight text-white">Quick actions</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className={`group rounded-2xl border border-white/[0.08] bg-gradient-to-br ${action.tint} p-5 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4bcff]`}
                >
                  <span className="inline-flex rounded-xl bg-black/20 p-2.5">
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </span>
                  <h3 className="mt-5 flex items-center justify-between font-semibold text-white">
                    {action.title}
                    <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111827]/85 p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-400">Handpicked for you</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Explore learning paths</h2>
              </div>
              <Link to="/courses" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-violet-200 hover:text-white">
                All courses <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {courses.map((course, index) => (
                <article key={course.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c1220]">
                  <div className={`flex h-28 items-end justify-between bg-gradient-to-br ${courseAccents[index]} p-4`}>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-slate-200">
                      {course.category}
                    </span>
                    <GraduationCap className="h-7 w-7 text-white/75" />
                  </div>
                  <div className="p-4">
                    <h3 className="min-h-12 font-semibold leading-6 text-white">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{course.duration}</span>
                      <span>{course.difficulty}</span>
                    </div>
                    <Link
                      to="/courses"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:border-violet-300/50 hover:bg-violet-300/10 hover:text-white"
                    >
                      Explore course <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#111827]/85 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-slate-400">Keep it simple</p>
                <h2 className="font-semibold text-white">Your next steps</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: 'Choose a topic to learn', to: '/courses', icon: BookOpen },
                { label: 'Set a goal for this week', to: '/study-planner', icon: Target },
                { label: 'Save your first note', to: '/notes', icon: FileText },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.label}
                    to={step.to}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 text-sm text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1">{step.label}</span>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-violet-200">
                  <LayoutDashboard className="h-4 w-4" />
                  Make it yours
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your courses, notes, and study plan are all one click away.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
