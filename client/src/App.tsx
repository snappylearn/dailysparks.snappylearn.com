import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Profile } from "@shared/schema";
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
import AdminUsers from "@/pages/admin/Users";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminSettings from "@/pages/admin/Settings";
import QuizPreview from "@/pages/QuizPreview";
import BadgesAndTrophies from "@/pages/BadgesAndTrophies";
import Challenges from "@/pages/Challenges";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Get user profiles if authenticated
  const { data: profiles, isLoading: profilesLoading } = useQuery<Profile[]>({
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

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Show onboarding if no profiles exist
  if (profiles && profiles.length === 0) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  // Show main app
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/quizzes">
        <AdminLayout>
          <AdminQuizzes />
        </AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      </Route>
      
      {/* Quiz Preview Route (for admin) */}
      <Route path="/quiz-preview/:quizId" component={QuizPreview} />
      <Route path="/quiz-preview/:quizId" component={QuizPreview} />
      
      {/* Student Routes */}
      <Route path="/" component={SimpleHome} />
      <Route path="/quiz/:sessionId?" component={Quiz} />
      <Route path="/quiz-history" component={QuizHistory} />
      <Route path="/results/:sessionId" component={Results} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/badges-trophies">
        <BadgesAndTrophies />
      </Route>
      <Route path="/challenges">
        <Challenges />
      </Route>
      <Route component={NotFound} />
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
