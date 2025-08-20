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

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
    enabled: user?.onboardingCompleted === true,
  });

  // Fetch today's challenge
  const { data: challengeData } = useQuery({
    queryKey: ["/api/challenge/today"],
    enabled: user?.onboardingCompleted === true,
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
    return <Onboarding />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Daily Sparks!</h2>
          <p className="text-gray-600">Choose a subject to start your learning journey</p>
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
    </MainLayout>
  );
}
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 font-poppins">Term Quiz</h3>
                  <p className="text-gray-600 text-sm mb-3">Questions from your current school term curriculum.</p>
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <i className="fas fa-school mr-1"></i>
                    <span>{user.currentTerm || 'Term 1'} Topics</span>
                  </div>
                  <Button 
                    onClick={() => handleStartQuiz('term', undefined, user.currentTerm)}
                    disabled={startQuizMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-gray-700 hover:from-blue-600 hover:to-gray-800 text-white py-3 font-semibold transform hover:scale-105 transition-all duration-200"
                  >
                    {startQuizMutation.isPending ? "Starting..." : "Start Term Quiz"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white p-4 pb-6">
        <div className="max-w-sm mx-auto">
          {/* Top Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-fire text-sm"></i>
              </div>
              <span className="font-bold text-lg font-poppins">Daily Spark</span>
            </div>
            <button 
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <i className="fas fa-user text-sm"></i>
            </button>
          </div>

          {/* Sparks and Streak */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{user?.sparks || 0}</div>
              <div className="text-sm opacity-90">💎 Sparks</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold streak-fire">{user?.streak || 0}</div>
              <div className="text-sm opacity-90">🔥 Day Streak</div>
            </div>
          </div>

          {/* Daily Challenge */}
          {challengeData?.challenge && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <i className="fas fa-trophy text-yellow-300"></i>
                <span className="font-semibold">Today's Challenge</span>
              </div>
              <p className="text-sm opacity-90">"{challengeData.challenge.description}"</p>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.min((challengeData.progress.currentValue / challengeData.challenge.targetValue) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs opacity-75 mt-1">
                {challengeData.progress.currentValue}/{challengeData.challenge.targetValue} completed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subject Selection */}
      <div className="max-w-sm mx-auto p-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center font-poppins">📚 Pick Your Subject</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {subjects?.map((subject: any) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectSelect(subject)}
                className="bg-gradient-to-br from-blue-500 to-teal-400 text-white p-4 rounded-xl font-medium text-center transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i className={`${subject.icon || 'fas fa-book'} text-xl mb-2 block`}></i>
                {subject.name}
              </button>
            ))}

            {/* Static subjects for demo if no subjects loaded */}
            {!subjects && (
              <>
                <button
                  onClick={() => handleSubjectSelect({ id: 'math', name: 'Mathematics', icon: 'fas fa-calculator' })}
                  className="bg-gradient-to-br from-blue-500 to-teal-400 text-white p-4 rounded-xl font-medium text-center transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-calculator text-xl mb-2 block"></i>
                  Mathematics
                </button>
                <button
                  onClick={() => handleSubjectSelect({ id: 'physics', name: 'Physics', icon: 'fas fa-atom' })}
                  className="bg-gradient-to-br from-green-400 to-teal-400 text-white p-4 rounded-xl font-medium text-center transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-atom text-xl mb-2 block"></i>
                  Physics
                </button>
              </>
            )}
          </div>

          {/* Add School CTA */}
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <p className="text-gray-900 font-medium mb-2">🏫 Join School Leaderboard</p>
            <button className="text-orange-500 font-semibold text-sm">
              Add School →
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
