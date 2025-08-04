import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import QuizInterface from "@/components/QuizInterface";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Quiz() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { toast } = useToast();

  // Fetch quiz data
  const { data: quizData, isLoading, error } = useQuery({
    queryKey: ["/api/quiz", sessionId],
    enabled: !!sessionId,
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (answerData: any) => {
      const res = await apiRequest("POST", "/api/quiz/answer", answerData);
      return res.json();
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
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete quiz mutation
  const completeQuizMutation = useMutation({
    mutationFn: async (quizSessionId: string) => {
      const res = await apiRequest("POST", "/api/quiz/complete", { quizSessionId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation(`/results/${sessionId}`);
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
        description: "Failed to complete quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!sessionId) {
      setLocation("/");
    }
  }, [sessionId, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fire text-white text-2xl"></i>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-teal-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz session could not be loaded.</p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  const handleAnswerSelect = async (answer: string) => {
    const questionStartTime = startTime;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Store user answer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Submit answer to backend
    await submitAnswerMutation.mutateAsync({
      quizSessionId: sessionId,
      questionId: currentQuestion.id,
      userAnswer: answer,
      timeSpent,
    });

    // Move to next question or complete quiz
    if (isLastQuestion) {
      await completeQuizMutation.mutateAsync(sessionId!);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setStartTime(Date.now());
    }
  };

  return (
    <QuizInterface
      question={currentQuestion}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={quizData.questions.length}
      progressPercentage={progressPercentage}
      onAnswerSelect={handleAnswerSelect}
      selectedAnswer={userAnswers[currentQuestion.id]}
      isSubmitting={submitAnswerMutation.isPending || completeQuizMutation.isPending}
    />
  );
}
