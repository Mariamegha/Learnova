import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import NavbarGold from "@/components/NavbarGold";
import DockNav from "@/components/DockNav";
import ClusterScreen from "@/components/ClusterScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessibilityFab } from "@/components/accessibility/AccessibilityFab";
import { CaptionBar } from "@/components/accessibility/CaptionBar";
import { useAccessibilityStore } from "@/store/accessibilityStore";
import { useUserStore } from "@/store/userStore";
import { initializeAuth } from "@/services/authService";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Suspense } from "react";
import { NAVIGATION_CLUSTERS } from "@/config/navigationClusters";
import { useNavigationStore } from "@/store/navigationStore";
import { ClusterType } from "@/types/navigation";

import LandingGold from "./pages/LandingGold";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardGold from "./pages/DashboardGold";
import AIBot from "./pages/AIBot";
import Roadmap from "./pages/Roadmap";
import Notes from "./pages/Notes";
import FocusRoom from "./pages/FocusRoom";
import StudyVR from "./pages/StudyVR";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StudyPlanner from "./pages/StudyPlanner";
import Workspace from "./pages/Workspace";
import SmartDeadline from "./pages/SmartDeadline";
import AdaptiveContent from "./pages/AdaptiveContent";
import KnowledgeOrbit from "./pages/KnowledgeOrbit";
import GameHub from "./pages/GameHub";
import GameDetail from "./pages/GameDetail";
import GameCompetitionLobby from "./pages/GameCompetitionLobby";
import GameMatchResults from "./pages/GameMatchResults";
import PerformanceTiers from "./pages/PerformanceTiers";
import SmartOpportunities from "./pages/SmartOpportunities";
import Wellness from "./pages/Wellness";
import Schemes from "./pages/Schemes";
import SignLanguage from "./pages/SignLanguage";
import SignLanguageSetup from "./pages/SignLanguageSetup";
import SignLanguageLesson from "./pages/SignLanguageLesson";
import SignLanguageTranslator from "./pages/SignLanguageTranslator";
import UnifiedOS from "./pages/UnifiedOS";
import CreateSpace from "./pages/CreateSpace";
import WorkspaceLayout from "./pages/WorkspaceLayout";
import WorkspaceView from "./pages/WorkspaceView";
import ClassroomWorkspace from "./pages/ClassroomWorkspace";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured || useUserStore.getState().authMode === 'local') {
      return;
    }

    // Initialize auth state on app load (only once)
    initializeAuth().then(() => {
      isAuthenticatedRef.current = useUserStore.getState().isAuthenticated;
    });

    // Handle OAuth callback explicitly
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      if (accessToken) {
        // Give Supabase time to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Trigger auth initialization
          await initializeAuth();
          isAuthenticatedRef.current = true;
        }
      }
    };

    handleOAuthCallback();

    // Listen for auth state changes (OAuth callback, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {
        // Prevent duplicate sign-in processing
        if (isAuthenticatedRef.current) {

          return;
        }

        const userName = session.user.user_metadata?.name || 
                         session.user.user_metadata?.full_name || 
                         session.user.email?.split('@')[0] || 
                         'User';

        // Immediately update store and redirect - don't wait for profile
        const userStoreData = {
          name: userName,
          email: session.user.email!,
          xp: 0,
          level: 1,
          streak: 0,
        };
        
        useUserStore.getState().login(session.user.email!, userName);
        useUserStore.setState({
          isAuthenticated: true,
          user: userStoreData,
        });
        
        isAuthenticatedRef.current = true;
        
        // Only navigate to dashboard if user is on login/register page or landing
        const currentPath = window.location.pathname;
        const isPublicPage = ['/', '/login', '/register'].includes(currentPath);
        if (isPublicPage) {
          navigate('/dashboard', { replace: true });
        }

        // Fetch/create profile in background (don't block redirect)
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              useUserStore.setState({
                user: {
                  name: profile.name,
                  email: profile.email,
                  xp: profile.xp,
                  level: profile.level,
                  streak: profile.streak,
                },
              });
            } else if (profileError?.code === 'PGRST116') {
              await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email!,
                  name: userName,
                  xp: 0,
                  level: 1,
                  streak: 0,
                });
            }
          } catch (error) {
            console.error('Profile sync error:', error);
            // Silent fail - user is already authenticated
          }
        }, 100);
      } else if (event === 'SIGNED_OUT') {

        useUserStore.getState().logout();
        isAuthenticatedRef.current = false;
        navigate('/login', { replace: true });
      } else if (event === 'TOKEN_REFRESHED') {

        // Token refresh is automatic, no action needed
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]); // Add navigate to deps

  return null;
}

function ClusterRouteHandler() {
  const location = useLocation();
  const clusterId = location.pathname.split('/')[2]; // Extract clusterId from /cluster/:clusterId
  
  const setActiveCluster = useNavigationStore((state) => state.setActiveCluster);
  const setIsInCluster = useNavigationStore((state) => state.setIsInCluster);
  
  useEffect(() => {
    if (clusterId) {
      setActiveCluster(clusterId as ClusterType);
      setIsInCluster(true);
    }
    return () => {
      setActiveCluster(null);
      setIsInCluster(false);
    };
  }, [clusterId, setActiveCluster, setIsInCluster]);
  
  const cluster = NAVIGATION_CLUSTERS[clusterId as keyof typeof NAVIGATION_CLUSTERS];
  
  if (!cluster) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <ClusterScreen cluster={cluster} />;
}

function ConditionalLayout() {
  const location = useLocation();
  const hideNavbar = ['/', '/login', '/register'].includes(location.pathname) ||
    location.pathname.startsWith('/unified-os') ||
    location.pathname.startsWith('/cluster');

  return (
    <div className="flex min-h-screen flex-col bg-deepblack">
      {!hideNavbar && <NavbarGold />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingGold />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Cluster Routes */}
          <Route
            path="/cluster/:clusterId"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <ClusterRouteHandler />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          
          <Route
                    path="/dashboard"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <DashboardGold />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/ai-bot"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <AIBot />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/roadmap"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Roadmap />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/notes"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Notes />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/focus-room"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <FocusRoom />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/study-vr"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <StudyVR />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Courses />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/courses/:courseId"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <CourseDetail />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/sign-language"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SignLanguage />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/sign-language/setup"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SignLanguageSetup />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/sign-language/lesson"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SignLanguageLesson />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/sign-language/translator"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SignLanguageTranslator />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Community />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/study-planner"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <StudyPlanner />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/workspace"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Workspace />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/workspace/:workspaceType"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <WorkspaceView />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/classroom-workspace"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <ClassroomWorkspace />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/smart-deadline"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SmartDeadline />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/adaptive-content"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <AdaptiveContent />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/knowledge-orbit"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <KnowledgeOrbit />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/game-hub"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <GameHub />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/game-hub/:gameId"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <GameDetail />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/game-hub/:gameId/lobby"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <GameCompetitionLobby />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/game-hub/:gameId/results"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <GameMatchResults />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/performance-tiers"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <PerformanceTiers />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/smart-opportunities"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <SmartOpportunities />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/wellness"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Wellness />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/schemes"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <Schemes />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/unified-os"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <UnifiedOS />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/unified-os/create"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <CreateSpace />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/unified-os/workspace/:spaceId"
                    element={
                      <ErrorBoundary>
                        <ProtectedRoute>
                          <WorkspaceLayout />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            {!hideNavbar && <DockNav />}
          </div>
  );
}

const App = () => {
  const { dyslexiaFont, textScale, highContrast, colorblindMode } = useAccessibilityStore();

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Dyslexia font - apply to body for better cascade
    if (dyslexiaFont) {
      body.classList.add('dyslexia-font');
      root.style.fontFamily = 'Comic Sans MS, Verdana, sans-serif';
    } else {
      body.classList.remove('dyslexia-font');
      root.style.fontFamily = '';
    }
    
    // Text scale
    root.style.fontSize = `${textScale}%`;
    
    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Colorblind filters
    const filters = {
      none: '',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)',
    };
    root.style.filter = filters[colorblindMode];
  }, [dyslexiaFont, textScale, highContrast, colorblindMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TranslationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-[#0F1115]">
                <div className="text-center">
                  <div className="mb-4 text-6xl font-black text-gold animate-pulse">EDUMITE</div>
                  <div className="text-text/60">Loading your learning universe...</div>
                </div>
              </div>
            }>
              <BrowserRouter>
                <AuthListener />
                <ConditionalLayout />
                <AccessibilityFab />
                <CaptionBar />
              </BrowserRouter>
            </Suspense>
          </TooltipProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;


