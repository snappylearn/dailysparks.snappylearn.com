import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, BookOpen, Users } from "lucide-react";

export default function QuizPreview() {
  const { quizId } = useParams<{ quizId: string }>();
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Fetch quiz data from API
  const { data: quizData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/quizzes', quizId],
    enabled: !!quizId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fire text-white text-2xl"></i>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Quiz Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation('/admin/quizzes')}>
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizData.questions?.[currentQuestionIndex];
  const progress = quizData.questions?.length ? ((currentQuestionIndex + 1) / quizData.questions.length) * 100 : 0;

  const handleNext = () => {
    if (quizData.questions && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin/quizzes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            Preview Mode
          </Badge>
        </div>

        {/* Quiz Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{quizData.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {quizData.subject || 'General'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {quizData.timeLimit || 30} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {quizData.totalQuestions || quizData.questions?.length || 0} questions
                  </div>
                </div>
                {quizData.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {quizData.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {quizData.level && <span>Level: {quizData.level}</span>}
                  {quizData.examSystem && <span>• {quizData.examSystem}</span>}
                  {quizData.term && <span>• {quizData.term}</span>}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {quizData.difficulty || 'medium'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizData.questions?.length || 0}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        {currentQuestion ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">{currentQuestion.content}</p>
                
                <div className="space-y-3">
                  {currentQuestion.choices?.map((choice, index) => (
                    <Button
                      key={choice.id}
                      variant="outline"
                      className="w-full text-left justify-start h-auto py-3 px-4 hover:bg-blue-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium mt-0.5">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{choice.content}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Show explanation in preview mode */}
                {currentQuestion.explanation && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Explanation (Preview Only)</h4>
                    <p className="text-green-700">{currentQuestion.explanation}</p>
                    <p className="text-sm text-green-600 mt-2">
                      Correct answer: <strong>{currentQuestion.choices?.find(c => c.isCorrect)?.content}</strong>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No question available.</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {quizData.questions?.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className="w-10 h-10"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleNext}
            disabled={!quizData.questions || currentQuestionIndex === quizData.questions.length - 1}
          >
            Next
          </Button>
        </div>

        {/* Preview Notice */}
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <p className="text-sm">
                <strong>Preview Mode:</strong> This shows how students will experience the quiz. 
                In the actual quiz, explanations are only shown after submission.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}