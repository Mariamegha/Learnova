import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/store/userStore';
import { signInAsLocalUser } from '@/services/authService';

const benefits = [
  'Pick up your learning from one simple workspace',
  'Build a steady study rhythm at your own pace',
  'Keep your notes, courses, and goals together',
];

export default function Login() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signInAsLocalUser(name);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090d18] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-48 right-0 h-[34rem] w-[34rem] rounded-full bg-[#8b7cf6]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />
      </div>

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-3" aria-label="Edumite home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9586f2] text-[#11131b]">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">edumite<span className="text-[#aa9df8]">.</span></span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <div className="relative mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-5 pb-12 pt-4 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <section className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            <Sparkles className="h-4 w-4" />
            A calmer way to make progress
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Make space for
            <span className="block bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
              what you want to learn.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Your courses, focus sessions, and ideas in one place. Start with your name and make the space yours.
          </p>

          <ul className="mt-9 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-slate-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-[#121827]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">Your learning space</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Let’s get started</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">What should we call you?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="learner-name" className="text-sm font-medium text-slate-200">Your name</Label>
                <Input
                  autoComplete="name"
                  autoFocus
                  id="learner-name"
                  maxLength={48}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError('');
                  }}
                  className="h-12 rounded-xl border-white/10 bg-[#0b1020] px-4 text-base text-white placeholder:text-slate-500 focus-visible:ring-violet-400"
                  aria-describedby={error ? 'name-error' : undefined}
                  aria-invalid={Boolean(error)}
                />
                {error && <p id="name-error" className="text-sm text-rose-300">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={!name.trim()}
                className="h-12 w-full rounded-xl bg-[#9586f2] text-base font-semibold text-[#11131b] transition hover:bg-[#aa9df8] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Continue to your workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
              Your name is saved on this device so you can pick up where you left off.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
