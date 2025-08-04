import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import { ArrowLeft, Clock, Target, Shuffle, BookOpen, Calendar, CheckCircle, XCircle, Zap, Trophy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Profile, Topic } from "@shared/schema";

interface QuizQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface QuizSession {
  sessionId: string;
  questions: QuizQuestion[];
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/quiz/:sessionId?");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedQuizType, setSelectedQuizType] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  
  // Quiz session states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<{questionId: string, answer: string, isCorrect: boolean}>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('subject');
  const subjectName = urlParams.get('name');
  const sessionId = params?.sessionId;

  // Get user profiles
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const currentProfile = profiles?.find(p => p.id === user?.defaultProfileId);

  // Get topics for the subject
  const { data: topics } = useQuery<Topic[]>({
    queryKey: ['/api/topics', subjectId, currentProfile?.levelId],
    enabled: !!subjectId && !!currentProfile?.levelId && selectedQuizType === 'topical',
  });

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async (data: { quizType: string; subjectId: string; topicId?: string; term?: string }) => {
      return await apiRequest("/api/quiz/start", "POST", {
        profileId: currentProfile?.id,
        ...data
      });
    },
    onSuccess: (response) => {
      setQuizSession(response);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setTimeSpent(0);
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { questionId: string; userAnswer: string; timeSpent: number }) => {
      return await apiRequest(`/api/quiz/${sessionId}/answer`, "POST", data);
    },
    onSuccess: (response, variables) => {
      setUserAnswers(prev => [...prev, {
        questionId: variables.questionId,
        answer: variables.userAnswer,
        isCorrect: response.isCorrect
      }]);
      
      // Move to next question or show results
      if (currentQuestionIndex < (quizSession?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer("");
      } else {
        completeQuizMutation.mutate();
      }
    },
  });

  // Complete quiz mutation
  const completeQuizMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/quiz/${sessionId}/complete`, "POST", {});
    },
    onSuccess: (response) => {
      setQuizResults(response);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
  });

  const handleStartQuiz = (quizType: string, topicId?: string, term?: string) => {
    if (!subjectId) return;
    
    startQuizMutation.mutate({
      quizType,
      subjectId,
      topicId,
      term
    });
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !quizSession) return;
    
    const currentQuestion = quizSession.questions[currentQuestionIndex];
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      timeSpent: Math.floor(timeSpent / 1000)
    });
  };

  // Timer effect for each question
  useEffect(() => {
    if (quizSession && !showResults) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1000);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizSession, showResults]);

  // Show quiz results
  if (showResults && quizResults) {
    const accuracy = Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100);
    const grade = accuracy >= 80 ? 'A' : accuracy >= 70 ? 'B' : accuracy >= 60 ? 'C' : accuracy >= 50 ? 'D' : 'E';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 w-fit">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              <CardDescription>{subjectName} Quiz Results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="font-bold text-2xl text-blue-600">{quizResults.correctAnswers}/{quizResults.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="font-bold text-2xl text-green-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="font-bold text-2xl text-purple-600">{quizResults.sparksEarned}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" />
                    Sparks Earned
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="font-bold text-2xl text-orange-600">{grade}</div>
                  <div className="text-sm text-gray-600">Grade</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setQuizSession(null);
                    setShowResults(false);
                    setSelectedQuizType("");
                  }}
                  className="w-full"
                >
                  Take Another Quiz
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show active quiz session
  if (quizSession && !showResults) {
    const currentQuestion = quizSession.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizSession.questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quizSession.questions.length}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {Math.floor(timeSpent / 60000)}:{String(Math.floor((timeSpent % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
            <Progress value={progress} className="mb-4" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {currentQuestion.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="A" id="option-a" />
                    <Label htmlFor="option-a" className="cursor-pointer flex-1">
                      <span className="font-medium mr-2">A.</span>
                      {currentQuestion.optionA}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="B" id="option-b" />
                    <Label htmlFor="option-b" className="cursor-pointer flex-1">
                      <span className="font-medium mr-2">B.</span>
                      {currentQuestion.optionB}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="C" id="option-c" />
                    <Label htmlFor="option-c" className="cursor-pointer flex-1">
                      <span className="font-medium mr-2">C.</span>
                      {currentQuestion.optionC}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="D" id="option-d" />
                    <Label htmlFor="option-d" className="cursor-pointer flex-1">
                      <span className="font-medium mr-2">D.</span>
                      {currentQuestion.optionD}
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="mt-6">
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer || submitAnswerMutation.isPending}
                  className="w-full"
                >
                  {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Quiz Type Selection - Single Row with 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Random Quiz */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shuffle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg">Random Quiz</CardTitle>
              <CardDescription>
                Mixed questions from all topics
              </CardDescription>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">30 Questions</span>
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

          {/* Column 2: Topical Quiz */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg">Topical Quiz</CardTitle>
              <CardDescription>
                Focus on specific topics
              </CardDescription>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Choose Topics</span>
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

          {/* Column 3: Termly Quizzes */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg">Termly Quizzes</CardTitle>
              <CardDescription>
                Select your preferred term
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Term 1', 'Term 2', 'Term 3'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-orange-50 hover:border-orange-300"
                  onClick={() => handleStartQuiz('term', term.toLowerCase().replace(' ', ''))}
                  disabled={startQuizMutation.isPending}
                >
                  Start {term}
                </Button>
              ))}
            </CardContent>
          </Card>
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