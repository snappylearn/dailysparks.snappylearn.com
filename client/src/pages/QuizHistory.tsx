import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/MainLayout";
import { Clock, CheckCircle, XCircle, RotateCcw, Calendar, Target, Trophy } from "lucide-react";
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
}

export default function QuizHistory() {
  const [, setLocation] = useLocation();
  
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{quizHistory.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quizHistory.filter(q => q.isCompleted).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quizHistory.length > 0 
                      ? `${Math.round(quizHistory.reduce((acc, q) => acc + (q.correctAnswers / q.totalQuestions) * 100, 0) / quizHistory.length)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRetakeQuiz(quiz)}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Retake
                        </Button>
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
    </MainLayout>
  );
}