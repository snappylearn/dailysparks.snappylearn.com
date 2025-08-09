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

  // Start quiz mutation
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
      // Transform the response to match our QuizSession interface
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
    },
    onError: (error) => {
      console.error('Quiz start failed:', error);
      alert('Failed to start quiz: ' + error.message);
    },
  });

  // Submit answer mutation
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
    
    if (!selectedQuizType) {
      alert('Please select a quiz type first');
      return;
    }
    
    if (selectedQuizType === 'topical' && !selectedTopic) {
      alert('Please select a topic for topical quiz');
      return;
    }
    
    if (selectedQuizType === 'term' && !selectedTerm) {
      alert('Please select a term for term quiz');
      return;
    }
    
    const data: { quizType: string; subjectId: string; topicId?: string; termId?: string } = {
      quizType: selectedQuizType,
      subjectId,
    };

    if (selectedQuizType === 'topical' && selectedTopic) {
      data.topicId = selectedTopic;
    } else if (selectedQuizType === 'term' && selectedTerm) {
      data.termId = selectedTerm;
    }

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
      </MainLayout>
    );
  }

  // Show quiz wizard (selection screen)
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
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

        {/* Quiz Type Selection - 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`cursor-pointer transition-all ${selectedQuizType === 'random' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6" onClick={() => setSelectedQuizType('random')}>
              <div className="text-center space-y-4">
                <div className="mx-auto p-4 rounded-full bg-blue-100 w-fit">
                  <Shuffle className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Random Quiz</h3>
                  <p className="text-sm text-gray-600 mt-2">Mix of questions from all topics</p>
                </div>
                <Badge variant={selectedQuizType === 'random' ? 'default' : 'secondary'}>
                  {selectedQuizType === 'random' ? 'Selected' : 'Select'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${selectedQuizType === 'topical' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6" onClick={() => {
              setSelectedQuizType('topical');
              setShowTopicModal(true);
            }}>
              <div className="text-center space-y-4">
                <div className="mx-auto p-4 rounded-full bg-green-100 w-fit">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Topical Quiz</h3>
                  <p className="text-sm text-gray-600 mt-2">Focus on specific topics</p>
                </div>
                <Badge variant={selectedQuizType === 'topical' ? 'default' : 'secondary'}>
                  {selectedQuizType === 'topical' ? 'Selected' : 'Select'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer transition-all ${selectedQuizType === 'term' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6" onClick={() => {
              setSelectedQuizType('term');
              setShowTermModal(true);
            }}>
              <div className="text-center space-y-4">
                <div className="mx-auto p-4 rounded-full bg-purple-100 w-fit">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Term Quiz</h3>
                  <p className="text-sm text-gray-600 mt-2">Questions from a specific term</p>
                </div>
                <Badge variant={selectedQuizType === 'term' ? 'default' : 'secondary'}>
                  {selectedQuizType === 'term' ? 'Selected' : 'Select'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Selection Modal */}
        <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Topic</DialogTitle>
                    <DialogDescription>Choose a topic for your {subjectName} quiz</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {topicsLoading ? (
                      <div className="col-span-full text-center py-8">Loading topics...</div>
                    ) : topicsError ? (
                      <div className="col-span-full text-center py-8 text-red-600">
                        Error loading topics: {topicsError.message}
                      </div>
                    ) : !topics || topics.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No topics available for this subject and level
                      </div>
                    ) : (
                      topics.map((topic) => (
                        <Button
                          key={topic.id}
                          variant="outline"
                          onClick={() => handleTopicSelect(topic)}
                          className="h-auto p-4 text-left justify-start"
                        >
                          <div>
                            <div className="font-medium">{topic.title}</div>
                            {topic.description && (
                              <div className="text-xs text-gray-500 mt-1">{topic.description}</div>
                            )}
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

        {/* Term Selection Modal */}
        <Dialog open={showTermModal} onOpenChange={setShowTermModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Term</DialogTitle>
                    <DialogDescription>Choose which academic term to focus on</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {terms?.map((term) => (
                      <Button
                        key={term.id}
                        variant="outline"
                        onClick={() => handleTermSelect(term)}
                        className="h-auto p-4 text-center"
                      >
                        <div>
                          <div className="font-medium">{term.title}</div>
                          <div className="text-xs text-gray-500 mt-1">Academic {term.title}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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
    </MainLayout>
  );
}