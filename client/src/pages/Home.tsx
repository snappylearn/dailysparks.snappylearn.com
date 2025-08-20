import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import Onboarding from "@/components/Onboarding";
import ProfileModal from "@/components/ProfileModal";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MainLayout } from "@/components/MainLayout";
import { BookOpen, Award, Trophy, Zap } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);

  // Fetch subjects
  const { data: subjects } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
    enabled: user?.onboardingCompleted === true,
  });

  // Fetch today's challenge
  const { data: challengeData } = useQuery<any>({
    queryKey: ["/api/challenge/today"],
    enabled: user?.onboardingCompleted === true,
  });

  // Fetch current profile for stats
  const { data: profiles } = useQuery<any[]>({
    queryKey: ["/api/profiles"],
    enabled: !!user?.id,
  });
  
  const currentProfile = profiles?.[0];

  // Fetch user badges
  const { data: userBadges } = useQuery<any[]>({
    queryKey: ["/api/user", user?.id, "badges"],
    enabled: !!user?.id,
  });

  // Fetch challenges
  const { data: challenges } = useQuery<any[]>({
    queryKey: ["/api/challenges"],
    enabled: !!user?.id,
  });

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      const res = await apiRequest("POST", "/api/quiz/start", quizData);
      return res.json();
    },
    onSuccess: (data) => {
      setLocation(`/quiz/${data.quizSession.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fire text-white text-2xl"></i>
        </div>
      </div>
    );
  }

  if (!user?.onboardingCompleted) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Daily Sparks!</h2>
          <p className="text-gray-600">Choose a subject to start your learning journey</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{currentProfile?.sparks || 0}</h3>
            <p className="text-sm text-gray-600">Total Sparks</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{userBadges?.length || 0}</h3>
            <p className="text-sm text-gray-600">Badges Earned</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{currentProfile?.currentStreak || 0}</h3>
            <p className="text-sm text-gray-600">Day Streak</p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects?.map((subject: any) => (
            <div key={subject.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${subject.color || 'bg-blue-500'} text-white`}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-gray-500 text-sm">{subject.code}</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setLocation(`/quiz?subject=${subject.id}`)}
                className="w-full"
              >
                Start Quiz
              </Button>
            </div>
          ))}
        </div>

        {/* Active Challenges Section - Below Dashboard */}
        {challenges && challenges.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Active Challenges</h3>
            </div>
            <div className="space-y-3">
              {challenges.slice(0, 3).map((challenge: any) => (
                <div key={challenge.id} className="bg-white/10 rounded-lg p-3">
                  <h4 className="font-medium mb-1">{challenge.title}</h4>
                  <p className="text-sm opacity-90 mb-2">{challenge.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Reward: {challenge.sparks} sparks</span>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span>+{challenge.streaks || 0} streak</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Challenge */}
        {challengeData && (
          <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg p-6 text-white">
            <h3 className="font-semibold text-lg mb-2">Today's Challenge</h3>
            <p className="mb-4">{challengeData.description}</p>
            <Button 
              variant="secondary" 
              onClick={() => setLocation(`/quiz?challenge=${challengeData.id}`)}
            >
              Take Challenge
            </Button>
          </div>
        )}
      </div>
      
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </MainLayout>
  );
}