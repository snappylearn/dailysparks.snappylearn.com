import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { ArrowLeft, Clock, Target, Shuffle, BookOpen, Calendar, CheckCircle, XCircle, Zap, Trophy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { MainLayout } from "@/components/MainLayout";
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
  const [selectedTopicName, setSelectedTopicName] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedTermName, setSelectedTermName] = useState<string>("");
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  
  // Quiz session states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<{questionId: string, answer: string, isCorrect: boolean}>>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [incompleteSession, setIncompleteSession] = useState<any>(null);
  
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

  const currentProfile = profiles?.[0]; // Use first profile for now

  // Get terms for term-based quizzes
  const { data: terms } = useQuery<Term[]>({
    queryKey: ['/api/terms'],
    enabled: selectedQuizType === 'term',
  });

  // Get topics for topical quizzes
  const { data: topics, isLoading: topicsLoading, error: topicsError } = useQuery<Topic[]>({
    queryKey: ['/api/topics', subjectId, currentProfile?.levelId],
    enabled: !!subjectId && !!currentProfile?.levelId && selectedQuizType === 'topical',
  });

  // Debug topics loading
  useEffect(() => {
    if (selectedQuizType === 'topical') {
      console.log('=== TOPICS DEBUG ===');
      console.log('Subject ID:', subjectId);
      console.log('Current Profile Level ID:', currentProfile?.levelId);
      console.log('Topics Loading:', topicsLoading);
      console.log('Topics Error:', topicsError);
      console.log('Topics Data:', topics);
      console.log('Topics Count:', topics?.length || 0);
    }
  }, [selectedQuizType, subjectId, currentProfile, topicsLoading, topicsError, topics]);

  // Start quiz mutation (using legacy API for backward compatibility)
  const startQuizMutation = useMutation({
    mutationFn: async (data: { quizType: string; subjectId: string; topicId?: string; termId?: string }) => {
      console.log('Making API request to start quiz...');
      const response = await apiRequest("POST", "/api/quiz/start", {
        profileId: currentProfile?.id,
        ...data
      });
      const jsonResponse = await response.json();
      console.log('Quiz start response:', jsonResponse);
      return jsonResponse as QuizSession;
    },
    onSuccess: (response) => {
      console.log('Quiz started successfully:', response);
      
      if (response.hasIncompleteSession) {
        // Show resume modal
        setIncompleteSession(response.incompleteSession);
        setShowResumeModal(true);
      } else {
        // Start new quiz directly
        const quizSessionData: QuizSession = {
          sessionId: response.sessionId,
          questions: response.questions,
          totalQuestions: response.totalQuestions || response.questions.length
        };
        setQuizSession(quizSessionData);
        setCurrentQuestionIndex(response.currentQuestionIndex || 0);
        setUserAnswers([]);
        setTimeSpent(0);
        setSelectedAnswer("");
      }
    },
    onError: (error: any) => {
      console.error('Quiz start failed:', error);
      if (error.message?.includes('subscription required') || error.message?.includes('Active subscription required')) {
        setLocation('/subscriptions');
        return;
      }
      alert('Failed to start quiz: ' + error.message);
    },
  });

  // Resume existing quiz session
  const resumeQuizMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/quiz/resume/${sessionId}`, {});
      return await response.json();
    },
    onSuccess: (response) => {
      const quizSessionData: QuizSession = {
        sessionId: response.sessionId,
        questions: response.questions,
        totalQuestions: response.totalQuestions || response.questions.length
      };
      setQuizSession(quizSessionData);
      setCurrentQuestionIndex(response.currentQuestionIndex || 0);
      setUserAnswers([]);
      setTimeSpent(0);
      setSelectedAnswer("");
      setShowResumeModal(false);
    },
    onError: (error: any) => {
      console.error('Resume quiz failed:', error);
      if (error.message?.includes('subscription required') || error.message?.includes('Active subscription required')) {
        setLocation('/subscriptions');
        return;
      }
      alert('Failed to resume quiz: ' + error.message);
    },
  });

  // Start fresh quiz session
  const startFreshQuizMutation = useMutation({
    mutationFn: async (data: { subjectId: string; quizType: string }) => {
      const response = await apiRequest("POST", "/api/quiz/start-fresh", {
        profileId: currentProfile?.id,
        subjectId: data.subjectId,
        quizType: data.quizType
      });
      return await response.json();
    },
    onSuccess: (response) => {
      const quizSessionData: QuizSession = {
        sessionId: response.sessionId,
        questions: response.questions,
        totalQuestions: response.totalQuestions || response.questions.length
      };
      setQuizSession(quizSessionData);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setTimeSpent(0);
      setSelectedAnswer("");
      setShowResumeModal(false);
    },
    onError: (error: any) => {
      console.error('Start fresh quiz failed:', error);
      if (error.message?.includes('subscription required') || error.message?.includes('Active subscription required')) {
        setLocation('/subscriptions');
        return;
      }
      alert('Failed to start fresh quiz: ' + error.message);
    },
  });

  // Submit answer mutation - individual submission with session persistence
  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { sessionId: string; questionId: string; userAnswer: string; timeSpent: number }) => {
      const response = await apiRequest("POST", `/api/quiz/${data.sessionId}/answer`, {
        questionId: data.questionId,
        userAnswer: data.userAnswer,
        timeSpent: data.timeSpent
      });
      const jsonResponse = await response.json();
      return jsonResponse as { isCorrect: boolean };
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
      const response = await apiRequest("POST", `/api/quiz/${data.sessionId}/complete`, {});
      const jsonResponse = await response.json();
      return jsonResponse as QuizResults;
    },
    onSuccess: (response) => {
      setQuizResults(response);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
  });

  const handleStartQuiz = () => {
    console.log('=== STARTING QUIZ DEBUG ===');
    console.log('Subject ID:', subjectId);
    console.log('Current Profile:', currentProfile);
    console.log('Selected Quiz Type:', selectedQuizType);
    console.log('Selected Topic:', selectedTopic);
    console.log('Selected Term:', selectedTerm);
    
    if (!subjectId) {
      alert('Missing subject ID - please go back to home and select a subject');
      return;
    }
    
    if (!currentProfile) {
      alert('No profile found - please set up your profile first');
      return;
    }
    
    // Simplified - no need for complex quiz type selection
    const data = {
      quizType: 'random',
      subjectId,
      profileId: currentProfile.id
    };

    console.log('Starting quiz with data:', data);
    startQuizMutation.mutate(data);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic.id);
    setSelectedTopicName(topic.title);
    setShowTopicModal(false);
  };

  const handleTermSelect = (term: Term) => {
    setSelectedTerm(term.id);
    setSelectedTermName(term.title);
    setShowTermModal(false);
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
      <MainLayout>
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

              {/* Navigation and Submit Buttons */}
              <div className="space-y-3 pt-4">
                {/* Submit Answer and Exit */}
                <div className="flex gap-3">
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
                    {submitAnswerMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      currentQuestionIndex === quizSession.questions.length - 1 ? "Finish Quiz" : "Next Question"
                    )}
                  </Button>
                </div>
                
                {/* Question Navigation */}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500 flex items-center px-2">
                    {currentQuestionIndex + 1} of {quizSession.questions.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.min(quizSession.questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === quizSession.questions.length - 1}
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Show simplified quiz start screen 
  return (
    <MainLayout>
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
          <p className="text-gray-600">Ready to test your knowledge? Let's get started!</p>
        </div>

        {/* Simple Quiz Card */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="mx-auto p-6 rounded-full bg-blue-100 w-fit mb-6">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Practice Quiz</h3>
            <p className="text-gray-600 mb-6">
              We'll randomly select questions from your {subjectName} curriculum to help you practice and learn.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Questions tailored to your level</p>
              <p>• Immediate feedback and explanations</p>
              <p>• Earn sparks for correct answers</p>
            </div>
          </CardContent>
        </Card>



        {/* Start Quiz Button */}
        <Button
          onClick={handleStartQuiz}
          disabled={startQuizMutation.isPending}
          className="w-full h-12 text-lg"
        >
          {startQuizMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading Questions...
            </div>
          ) : "Start Quiz"}
        </Button>
      </div>

      {/* Resume Quiz Modal */}
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Continue Your Quiz?
            </DialogTitle>
            <DialogDescription>
              You have an incomplete {subjectName} quiz from{' '}
              {incompleteSession?.startedAt ? 
                new Date(incompleteSession.startedAt).toLocaleDateString() : 
                'recently'
              }.
              <br />
              <span className="font-medium">
                Progress: {(incompleteSession?.currentQuestionIndex || 0) + 1} of {incompleteSession?.totalQuestions || 0} questions
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => resumeQuizMutation.mutate(incompleteSession?.sessionId)}
              disabled={resumeQuizMutation.isPending}
              className="w-full"
            >
              {resumeQuizMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continue Quiz
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!subjectId) return;
                startFreshQuizMutation.mutate({ 
                  subjectId, 
                  quizType: 'random' 
                });
              }}
              disabled={startFreshQuizMutation.isPending}
              className="w-full"
            >
              {startFreshQuizMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Starting...
                </div>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Start New Quiz
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}