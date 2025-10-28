import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MainLayout } from "@/components/MainLayout";
import { UserProgressStats } from "@/components/UserProgressStats";
import { Clock, CheckCircle, XCircle, RotateCcw, Calendar, Target, Trophy, Eye } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow, format } from "date-fns";

interface QuizHistoryEntry {
  id: string;
  subjectName: string;
  subjectCode: string;
  quizType: 'random' | 'topical' | 'termly';
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeTaken: number; // in seconds
  sparksEarned: number;
  isCompleted: boolean;
  examinationSystem: string;
  level: string;
}

export default function QuizHistory() {
  const [, setLocation] = useLocation();
  const [selectedQuizForReview, setSelectedQuizForReview] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const { data: quizHistory = [], isLoading } = useQuery<QuizHistoryEntry[]>({
    queryKey: ['/api/quiz-history'],
  });

  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case 'random': return 'Random Quiz';
      case 'topical': return 'Topical Quiz';
      case 'termly': return 'Term Quiz';
      default: return 'Quiz';
    }
  };

  const getScoreColor = (correctAnswers: number, totalQuestions: number) => {
    const percentage = (correctAnswers / totalQuestions) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleRetakeQuiz = (entry: QuizHistoryEntry) => {
    // Navigate to quiz page with the same subject and type
    const queryParams = new URLSearchParams({
      subject: entry.subjectName, // We'll need to map this properly
      type: entry.quizType,
    });
    setLocation(`/quiz?${queryParams.toString()}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Target className="h-6 w-6 text-orange-500 mr-3" />
              Quiz History
            </h2>
            <p className="text-gray-600">Track your learning progress and retake quizzes</p>
          </div>
          
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Target className="h-6 w-6 text-orange-500 mr-3" />
            Quiz History
          </h2>
          <p className="text-gray-600">Track your learning progress and retake quizzes</p>
        </div>

        {/* Stats Overview - Live data from backend */}
        <UserProgressStats />

        {/* Quiz History List */}
        {quizHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz History Yet</h3>
              <p className="text-gray-500 mb-6">Start taking quizzes to see your progress here</p>
              <Button 
                onClick={() => setLocation('/')}
                className="bg-gradient-to-r from-orange-500 to-yellow-400"
              >
                Take Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizHistory.map((quiz) => (
              <Card key={quiz.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {quiz.subjectName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {quiz.subjectCode}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getQuizTypeLabel(quiz.quizType)}
                        </Badge>
                        {quiz.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {quiz.examinationSystem}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          {quiz.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDistanceToNow(new Date(quiz.completedAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {quiz.isCompleted && (
                          <>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span className={getScoreColor(quiz.correctAnswers, quiz.totalQuestions)}>
                                {quiz.correctAnswers}/{quiz.totalQuestions} ({Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%)
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(quiz.timeTaken)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-orange-500" />
                              <span>{quiz.sparksEarned} sparks</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {quiz.isCompleted ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedQuizForReview(quiz.id);
                              setShowReviewModal(true);
                            }}
                            className="flex items-center gap-2"
                            data-testid={`button-review-quiz-${quiz.id}`}
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRetakeQuiz(quiz)}
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Retake
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => setLocation(`/quiz/${quiz.id}`)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Review Modal */}
      {selectedQuizForReview && (
        <QuizReviewModal
          sessionId={selectedQuizForReview}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedQuizForReview(null);
          }}
        />
      )}
    </MainLayout>
  );
}

// Quiz Review Modal Component
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