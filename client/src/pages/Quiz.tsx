import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ArrowLeft, Clock, Target, Shuffle, BookOpen, Calendar, CheckCircle, XCircle, Zap, Trophy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Profile, Topic, Term, Question } from "@shared/schema";

interface QuizQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
}

interface QuizSession {
  sessionId: string;
  questions: QuizQuestion[];
  totalQuestions: number;
}

interface QuizResults {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  sparksEarned: number;
  timeSpent: number;
  completed: boolean;
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/quiz/:sessionId?");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Quiz wizard states
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
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('subject');
  const subjectName = urlParams.get('name') || 'Subject';
  const sessionId = params?.sessionId;

  // Get user data
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  const currentProfile = profiles?.find(p => p.id === user?.defaultProfileId);

  // Get terms for term-based quizzes
  const { data: terms } = useQuery<Term[]>({
    queryKey: ['/api/terms'],
    enabled: selectedQuizType === 'term',
  });

  // Get topics for topical quizzes
  const { data: topics } = useQuery<Topic[]>({
    queryKey: ['/api/topics', subjectId, currentProfile?.levelId],
    enabled: !!subjectId && !!currentProfile?.levelId && selectedQuizType === 'topical',
  });

  // Start quiz mutation
  const startQuizMutation = useMutation({
    mutationFn: async (data: { quizType: string; subjectId: string; topicId?: string; termId?: string }) => {
      const response = await apiRequest("/api/quiz/start", "POST", {
        profileId: currentProfile?.id,
        ...data
      });
      return response as QuizSession;
    },
    onSuccess: (response) => {
      setQuizSession(response);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setTimeSpent(0);
      setSelectedAnswer("");
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { sessionId: string; questionId: string; userAnswer: string; timeSpent: number }) => {
      const response = await apiRequest(`/api/quiz/${data.sessionId}/answer`, "POST", {
        questionId: data.questionId,
        userAnswer: data.userAnswer,
        timeSpent: data.timeSpent
      });
      return response as { isCorrect: boolean };
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
        completeQuizMutation.mutate({ sessionId: variables.sessionId });
      }
    },
  });

  // Complete quiz mutation
  const completeQuizMutation = useMutation({
    mutationFn: async (data: { sessionId: string }) => {
      const response = await apiRequest(`/api/quiz/${data.sessionId}/complete`, "POST", {});
      return response as QuizResults;
    },
    onSuccess: (response) => {
      setQuizResults(response);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
  });

  const handleStartQuiz = () => {
    if (!subjectId || !currentProfile) return;
    
    const data: { quizType: string; subjectId: string; topicId?: string; termId?: string } = {
      quizType: selectedQuizType,
      subjectId,
    };

    if (selectedQuizType === 'topical' && selectedTopic) {
      data.topicId = selectedTopic;
    } else if (selectedQuizType === 'term' && selectedTerm) {
      data.termId = selectedTerm;
    }

    startQuizMutation.mutate(data);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !quizSession || !quizSession.sessionId) return;
    
    const currentQuestion = quizSession.questions[currentQuestionIndex];
    submitAnswerMutation.mutate({
      sessionId: quizSession.sessionId,
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
                    setSelectedTopic("");
                    setSelectedTerm("");
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
                {Math.floor(timeSpent / 1000)}s
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {currentQuestion?.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="A" id="option-a" />
                    <Label htmlFor="option-a" className="flex-1 cursor-pointer">
                      <span className="font-medium text-blue-600 mr-2">A.</span>
                      {currentQuestion?.optionA}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="B" id="option-b" />
                    <Label htmlFor="option-b" className="flex-1 cursor-pointer">
                      <span className="font-medium text-green-600 mr-2">B.</span>
                      {currentQuestion?.optionB}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="C" id="option-c" />
                    <Label htmlFor="option-c" className="flex-1 cursor-pointer">
                      <span className="font-medium text-orange-600 mr-2">C.</span>
                      {currentQuestion?.optionC}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="D" id="option-d" />
                    <Label htmlFor="option-d" className="flex-1 cursor-pointer">
                      <span className="font-medium text-purple-600 mr-2">D.</span>
                      {currentQuestion?.optionD}
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Quiz
                </Button>
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer || submitAnswerMutation.isPending}
                  className="flex-1"
                >
                  {currentQuestionIndex === quizSession.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show quiz wizard (selection screen)
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
          <h1 className="text-2xl font-bold">{subjectName} Quiz</h1>
          <p className="text-gray-600">Choose your quiz type and get started!</p>
        </div>

        <div className="grid gap-6">
          {/* Quiz Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Quiz Type</CardTitle>
              <CardDescription>Choose how you want to be tested</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                variant={selectedQuizType === 'random' ? 'default' : 'outline'}
                onClick={() => setSelectedQuizType('random')}
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Shuffle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Random Quiz</div>
                    <div className="text-sm text-gray-600">Mix of questions from all topics</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant={selectedQuizType === 'topical' ? 'default' : 'outline'}
                onClick={() => setSelectedQuizType('topical')}
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Topical Quiz</div>
                    <div className="text-sm text-gray-600">Focus on specific topics</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant={selectedQuizType === 'term' ? 'default' : 'outline'}
                onClick={() => setSelectedQuizType('term')}
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Term Quiz</div>
                    <div className="text-sm text-gray-600">Questions from a specific term</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Topic Selection (for topical quiz) */}
          {selectedQuizType === 'topical' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Topic</CardTitle>
                <CardDescription>Choose a specific topic to focus on</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {topics?.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Term Selection (for term quiz) */}
          {selectedQuizType === 'term' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Term</CardTitle>
                <CardDescription>Choose which academic term to focus on</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a term..." />
                  </SelectTrigger>
                  <SelectContent>
                    {terms?.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Start Quiz Button */}
          <Button
            onClick={handleStartQuiz}
            disabled={
              !selectedQuizType || 
              (selectedQuizType === 'topical' && !selectedTopic) ||
              (selectedQuizType === 'term' && !selectedTerm) ||
              startQuizMutation.isPending
            }
            className="w-full h-12 text-lg"
          >
            {startQuizMutation.isPending ? "Starting Quiz..." : "Start Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}