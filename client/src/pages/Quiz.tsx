import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Clock, Target, Shuffle, BookOpen, Calendar } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Profile } from "@shared/schema";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/quiz");
  const { user } = useAuth();
  const [selectedQuizType, setSelectedQuizType] = useState<string>("");
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('subject');
  const subjectName = urlParams.get('name');

  // Get user profiles
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const currentProfile = profiles?.find(p => p.id === user?.defaultProfileId);

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async (data: { type: string; subjectId?: string; term?: string }) => {
      return await apiRequest("/api/quiz/start", "POST", {
        profileId: currentProfile?.id,
        ...data
      });
    },
    onSuccess: (response) => {
      // Navigate to quiz session
      setLocation(`/quiz/${response.sessionId}`);
    },
  });

  const handleStartQuiz = (type: string, term?: string) => {
    startQuizMutation.mutate({
      type,
      subjectId: subjectId || undefined,
      term
    });
  };

  if (!subjectId || !subjectName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Invalid Quiz Selection</CardTitle>
              <CardDescription>
                Please select a subject from the dashboard to start a quiz.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {decodeURIComponent(subjectName)} Quiz
            </h1>
            <p className="text-gray-600">
              Choose your preferred quiz type to get started
            </p>
          </div>
        </div>

        {/* Quiz Type Selection */}
        <div className="space-y-4">
          {/* Random Quiz */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shuffle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Random Quiz</CardTitle>
                    <CardDescription>
                      Mixed questions from all topics
                    </CardDescription>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">30 Questions</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => handleStartQuiz('random')}
                disabled={startQuizMutation.isPending}
              >
                {startQuizMutation.isPending ? "Starting..." : "Start Random Quiz"}
              </Button>
            </CardContent>
          </Card>

          {/* Topical Quiz */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Topical Quiz</CardTitle>
                    <CardDescription>
                      Focus on specific topics
                    </CardDescription>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Choose Topics</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full hover:bg-green-50 hover:border-green-300"
                onClick={() => handleStartQuiz('topical')}
                disabled={startQuizMutation.isPending}
              >
                Select Topics & Start
              </Button>
            </CardContent>
          </Card>

          {/* Term-based Quizzes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Term 1', 'Term 2', 'Term 3'].map((term) => (
              <Card key={term} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">{term} Quiz</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full hover:bg-orange-50 hover:border-orange-300"
                    onClick={() => handleStartQuiz('term', term.toLowerCase().replace(' ', ''))}
                    disabled={startQuizMutation.isPending}
                  >
                    Start {term}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quiz Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-blue-800 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Quiz Information</span>
            </div>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Each quiz contains 30 carefully selected questions</li>
              <li>• You'll earn sparks for every correct answer</li>
              <li>• Complete quizzes to maintain your learning streak</li>
              <li>• Review explanations after each question</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}