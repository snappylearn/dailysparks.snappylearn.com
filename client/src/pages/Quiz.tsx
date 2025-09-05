import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { ArrowLeft, Clock, Target, Shuffle, BookOpen, Calendar, CheckCircle, XCircle, Zap, Trophy, Eye, FileText } from "lucide-react";
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
  correctAnswers: number;
  totalQuestions: number;
  score: string;
  percentage: number;
  accuracy: number;
  grade: string;
  sparksEarned: number;
  bonusMultiplier?: number;
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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStudyNotesModal, setShowStudyNotesModal] = useState(false);
  
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
    enabled: selectedQuizType === 'termly',
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
      if (error.message?.includes('subscription required') || error.message?.includes('Active subscription required') || error.message?.includes('403')) {
        setShowSubscriptionModal(true);
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


  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic.id);
    setSelectedTopicName(topic.title);
    setShowTopicModal(false);
    
    // Start topical quiz immediately
    if (subjectId && currentProfile) {
      const data = {
        quizType: 'topical',
        subjectId,
        profileId: currentProfile.id,
        topicId: topic.id
      };
      startQuizMutation.mutate(data);
    }
  };

  const handleTermSelect = (term: Term) => {
    setSelectedTerm(term.id);
    setSelectedTermName(term.title);
    setShowTermModal(false);
    
    // Start termly quiz immediately
    if (subjectId && currentProfile) {
      const data = {
        quizType: 'termly',
        subjectId,
        profileId: currentProfile.id,
        termId: term.id
      };
      startQuizMutation.mutate(data);
    }
  };

  // Handle study notes topic selection
  const handleStudyNotesTopicSelect = (topic: Topic) => {
    setShowStudyNotesModal(false);
    setLocation(`/study-notes/${topic.id}?subject=${encodeURIComponent(subjectName)}`);
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
    const accuracy = quizResults.accuracy || 0; // Use accuracy from backend response
    const grade = quizResults.grade || 'F'; // Use grade from backend response
    
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
                  onClick={() => setShowReviewModal(true)}
                  variant="default"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  data-testid="button-review-answers"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review Answers
                </Button>
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

        {/* Study Notes Card - spans full width */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">Study Notes</h3>
                </div>
                <p className="text-blue-700 mb-3">
                  Access comprehensive AI-generated study materials for {subjectName} topics
                </p>
                <p className="text-sm text-blue-600">
                  Get detailed notes, explanations, and examples tailored to your curriculum level
                </p>
              </div>
              <div className="ml-6">
                <Button
                  onClick={() => setShowStudyNotesModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-start-studying"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Studying
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Type Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Random Quiz */}
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto p-4 rounded-full bg-orange-100 w-fit mb-4">
                <Shuffle className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Random Quiz</h3>
              <p className="text-gray-600 text-sm mb-4">
                Mixed questions from your {subjectName} curriculum
              </p>
              <Button
                onClick={() => {
                  setSelectedQuizType('random');
                  // Start random quiz immediately
                  if (subjectId && currentProfile) {
                    const data = {
                      quizType: 'random',
                      subjectId,
                      profileId: currentProfile.id
                    };
                    startQuizMutation.mutate(data);
                  }
                }}
                className="w-full"
                data-testid="button-select-random"
                disabled={startQuizMutation.isPending}
              >
                {startQuizMutation.isPending && selectedQuizType === 'random' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Getting your quiz ready...
                  </div>
                ) : 'Start Random Quiz'}
              </Button>
            </CardContent>
          </Card>

          {/* Topical Quiz */}
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto p-4 rounded-full bg-green-100 w-fit mb-4">
                <Target className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Topical Quiz</h3>
              <p className="text-gray-600 text-sm mb-4">
                Focus on a specific topic
              </p>
              {selectedQuizType === 'topical' && selectedTopicName && (
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {selectedTopicName}
                  </Badge>
                </div>
              )}
              <Button
                onClick={() => {
                  setSelectedQuizType('topical');
                  setShowTopicModal(true);
                }}
                className="w-full"
                data-testid="button-select-topical"
                disabled={startQuizMutation.isPending}
              >
                {startQuizMutation.isPending && selectedQuizType === 'topical' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Preparing your quiz...
                  </div>
                ) : 'Start Topical Quiz'}
              </Button>
            </CardContent>
          </Card>

          {/* Termly Quiz */}
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="mx-auto p-4 rounded-full bg-purple-100 w-fit mb-4">
                <Calendar className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Termly Quiz</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test knowledge from a specific term
              </p>
              {selectedQuizType === 'termly' && selectedTermName && (
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {selectedTermName}
                  </Badge>
                </div>
              )}
              <Button
                onClick={() => {
                  setSelectedQuizType('termly');
                  setShowTermModal(true);
                }}
                className="w-full"
                data-testid="button-select-termly"
                disabled={startQuizMutation.isPending}
              >
                {startQuizMutation.isPending && selectedQuizType === 'termly' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Preparing your quiz...
                  </div>
                ) : 'Start Termly Quiz'}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Topic Selection Modal */}
      <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Select Topic
            </DialogTitle>
            <DialogDescription>
              Choose a topic to focus your quiz on. Topics are filtered based on your current examination system and level.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96">
            {topicsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-sm text-gray-600">Loading topics...</span>
              </div>
            ) : topics && topics.length > 0 ? (
              <div className="space-y-2">
                {topics.map((topic) => (
                  <Button
                    key={topic.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleTopicSelect(topic)}
                    disabled={startQuizMutation.isPending}
                  >
                    {startQuizMutation.isPending && selectedTopic === topic.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Preparing your quiz...</span>
                      </div>
                    ) : (
                      <div className="text-left">
                        <div className="font-medium">{topic.title}</div>
                        {topic.description && (
                          <div className="text-sm text-gray-500 mt-1">{topic.description}</div>
                        )}
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No topics found for your current level and examination system.</p>
                <p className="text-sm text-gray-400 mt-2">Please check your profile settings or try a different subject.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Study Notes Topic Selection Modal */}
      <Dialog open={showStudyNotesModal} onOpenChange={setShowStudyNotesModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Select Topic for Study Notes
            </DialogTitle>
            <DialogDescription>
              Choose a topic from {subjectName} to access comprehensive study materials.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96">
            {topicsLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-sm text-gray-600">Loading topics...</span>
              </div>
            ) : topics && topics.length > 0 ? (
              <div className="space-y-2">
                {topics.map((topic) => (
                  <Button
                    key={topic.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4 hover:bg-blue-50"
                    onClick={() => handleStudyNotesTopicSelect(topic)}
                  >
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        {topic.title}
                      </div>
                      {topic.description && (
                        <div className="text-sm text-gray-500 mt-1">{topic.description}</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No topics found for your current level and examination system.</p>
                <p className="text-sm text-gray-400 mt-2">Please check your profile settings or try a different subject.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Term Selection Modal */}
      <Dialog open={showTermModal} onOpenChange={setShowTermModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Select Term
            </DialogTitle>
            <DialogDescription>
              Choose a term to test your knowledge on content covered during that period.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96">
            {terms && terms.length > 0 ? (
              <div className="space-y-2">
                {terms
                  .filter(term => term.examinationSystemId === currentProfile?.examinationSystemId)
                  .map((term) => (
                  <Button
                    key={term.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleTermSelect(term)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{term.title}</div>
                      {term.description && (
                        <div className="text-sm text-gray-500 mt-1">{term.description}</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No terms found for your examination system.</p>
                <p className="text-sm text-gray-400 mt-2">Please check your profile settings.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Required Modal */}
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Subscription Required
            </DialogTitle>
            <DialogDescription>
              You need an active subscription to take quizzes. Subscribe now to unlock unlimited access to all quiz features and start your learning journey!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                setLocation('/subscriptions');
              }}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              View Subscription Plans
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Quiz Review Modal */}
      {quizResults && (
        <QuizReviewModal
          sessionId={quizResults.sessionId}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </MainLayout>
  );
}

// Quiz Review Modal Component for the results page
function QuizReviewModal({ sessionId, isOpen, onClose }: {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['/api/quiz-sessions', sessionId, 'review'],
    enabled: isOpen && !!sessionId,
  });


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Quiz Review: {reviewData?.subjectName}
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of your answers and explanations
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : reviewData ? (
          <div className="space-y-4">
            {/* Quiz Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-bold text-lg text-blue-600">
                  {reviewData.correctAnswers}/{reviewData.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-bold text-lg text-green-600">
                  {Math.round((reviewData.correctAnswers / reviewData.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-bold text-lg text-purple-600">
                  {reviewData.questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
              {reviewData.questions.map((question: any, index: number) => {
                const correctChoice = question.choices?.find((c: any) => c.isCorrect);
                const userChoice = question.choices?.find((c: any) => 
                  c.orderIndex === (question.userAnswer ? question.userAnswer.charCodeAt(0) - 64 : 0)
                );
                
                return (
                  <Card key={question.id} className="border-l-4" style={{
                    borderLeftColor: question.isCorrect ? '#10b981' : '#ef4444'
                  }}>
                    <CardContent className="p-6">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Question {index + 1}
                            </span>
                            {question.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-3">
                            {question.content}
                          </h4>
                        </div>
                      </div>

                      {/* Choices */}
                      <div className="space-y-2 mb-4">
                        {question.choices?.map((choice: any) => {
                          const isUserChoice = choice.orderIndex === (question.userAnswer ? question.userAnswer.charCodeAt(0) - 64 : 0);
                          const isCorrectChoice = choice.isCorrect;
                          
                          let bgColor = 'bg-gray-50';
                          let borderColor = 'border-gray-200';
                          let textColor = 'text-gray-700';
                          
                          if (isCorrectChoice) {
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            textColor = 'text-green-800';
                          } else if (isUserChoice && !isCorrectChoice) {
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            textColor = 'text-red-800';
                          }
                          
                          return (
                            <div
                              key={choice.id}
                              className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {String.fromCharCode(64 + choice.orderIndex)}.
                                </span>
                                <span>{choice.content}</span>
                                {isCorrectChoice && (
                                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                )}
                                {isUserChoice && !isCorrectChoice && (
                                  <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Answer Summary */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Your answer:</strong> {question.userAnswer || 'No answer'} 
                          {userChoice && ` (${userChoice.content})`}
                        </div>
                        <div>
                          <strong>Correct answer:</strong> {correctChoice ? String.fromCharCode(64 + correctChoice.orderIndex) : 'N/A'} 
                          {correctChoice && ` (${correctChoice.content})`}
                        </div>
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-blue-900 text-sm mb-1">Explanation</div>
                              <div className="text-blue-800 text-sm">{question.explanation}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Unable to load quiz review</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}