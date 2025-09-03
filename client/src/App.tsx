import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { Profile as ProfileType } from "@shared/schema";
import Landing from "@/pages/Landing";
import SimpleHome from "@/pages/SimpleHome";
import Quiz from "@/pages/Quiz";
import QuizHistory from "@/pages/QuizHistory";
import Results from "@/pages/Results";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "@/pages/not-found";
import Onboarding from "@/components/Onboarding";
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminQuizzes from "@/pages/admin/Quizzes";
import AdminTopics from "@/pages/admin/Topics";
import AdminExaminationSystems from "@/pages/admin/ExaminationSystems";
import AdminLevels from "@/pages/admin/Levels";
import AdminSubjects from "@/pages/admin/Subjects";
import AdminTerms from "@/pages/admin/Terms";
import AdminUsers from "@/pages/admin/Users";
import QuizTypes from "@/pages/admin/QuizTypes";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminSettings from "@/pages/admin/Settings";
import PlatformSettings from "@/pages/admin/PlatformSettings";
import QuizPreview from "@/pages/QuizPreview";
import BadgesAndTrophies from "@/pages/BadgesAndTrophies";
import Challenges from "@/pages/Challenges";
import Subscriptions from "@/pages/Subscriptions";
import Profile from "@/pages/Profile";
import AdminLogin from "@/pages/admin/AdminLogin";

function Router() {
  return (
    <Switch>
      {/* All routes go through authentication check */}
      <Route path="/*" component={AuthenticatedRoutes} />
    </Switch>
  );
}

function AuthenticatedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Get user profiles if authenticated
  const { data: profiles, isLoading: profilesLoading } = useQuery<ProfileType[]>({
    queryKey: ['/api/profiles'],
    enabled: isAuthenticated,
  });

  // Show loading state
  if (isLoading || (isAuthenticated && profilesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fire text-white text-2xl"></i>
        </div>
      </div>
    );
  }

  // Show landing page or admin login for non-authenticated users
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/" component={Landing} />
        {/* Redirect all other paths to landing */}
        <Route>
          {() => {
            window.location.href = '/';
            return null;
          }}
        </Route>
      </Switch>
    );
  }

  // Show onboarding if no profiles exist
  if (profiles && profiles.length === 0) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  // Show main app routes
  return (
    <Switch>
      {/* Root path redirect to home for authenticated users */}
      <Route path="/" exact>
        {() => {
          window.location.href = '/home';
          return null;
        }}
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/quizzes">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminQuizzes />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/topics">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminTopics />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/examination-systems">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminExaminationSystems />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/levels">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminLevels />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/subjects">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminSubjects />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/terms">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminTerms />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/users">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/quiz-types">
        <AdminAuthProvider>
          <AdminLayout>
            <QuizTypes />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/analytics">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/settings">
        <AdminAuthProvider>
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>
      <Route path="/admin/platform-settings">
        <AdminAuthProvider>
          <AdminLayout>
            <PlatformSettings />
          </AdminLayout>
        </AdminAuthProvider>
      </Route>

      {/* Quiz Preview Route (for admin) */}
      <Route path="/quiz-preview/:quizId" component={QuizPreview} />

      {/* Student Routes */}
      <Route path="/home" component={SimpleHome} />
      <Route path="/quiz/:sessionId?" component={Quiz} />
      <Route path="/quiz-history" component={QuizHistory} />
      <Route path="/results/:sessionId" component={Results} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/badges-trophies" component={BadgesAndTrophies} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/profile" component={Profile} />

      {/* Admin login route - accessible without main auth */}
      <Route path="/admin-login" component={AdminLogin} />

      {/* Default route for authenticated users */}
      <Route component={SimpleHome} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;