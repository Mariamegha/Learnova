import { BookOpen, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/authService';
import { useUserStore } from '@/store/userStore';

const appLinks = [
  { label: 'Overview', to: '/dashboard' },
  { label: 'Courses', to: '/courses' },
  { label: 'Study plan', to: '/study-planner' },
  { label: 'AI tutor', to: '/ai-bot' },
  { label: 'Notes', to: '/notes' },
];

export default function NavbarGold() {
  const location = useLocation();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  const handleSignOut = async () => {
    await signOut();
  };

  const renderLinks = (mobile = false) => (
    <nav
      aria-label={mobile ? 'Main navigation' : 'Primary navigation'}
      className={mobile ? 'flex gap-1 overflow-x-auto px-4 py-2 lg:hidden' : 'hidden items-center gap-1 lg:flex'}
    >
      {(isAuthenticated ? appLinks : [{ label: 'Home', to: '/' }, { label: 'Features', to: '/#features' }]).map((link) => {
        const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1020]/90 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="inline-flex shrink-0 items-center gap-2.5"
          aria-label="Edumite home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9586f2] text-[#11131b]">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">edumite<span className="text-[#aa9df8]">.</span></span>
        </Link>

        {renderLinks()}

        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <>
              {user && (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c2537] text-xs font-semibold text-[#c4bcff]">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-32 truncate text-sm font-medium text-slate-200">{user.name}</span>
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-lg bg-[#9586f2] font-semibold text-[#11131b] hover:bg-[#aa9df8]">
              <Link to="/login">Get started</Link>
            </Button>
          )}
        </div>
      </div>
      {renderLinks(true)}
    </header>
  );
}
