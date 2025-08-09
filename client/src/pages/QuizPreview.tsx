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

  // Mock quiz data based on our created quizzes
  const mockQuizData = {
    id: quizId,
    title: "Introduction to Biology - Sample Quiz",
    subject: "Biology",
    description: "Test your knowledge of basic biology concepts including cell structure, living organisms, and biological processes.",
    totalQuestions: 15,
    timeLimit: 30,
    difficulty: "medium",
    questions: [
      {
        id: "q_1",
        content: "What is the basic unit of life in all living organisms?",
        type: "mcq",
        choices: [
          { id: "c_1", content: "Cell", isCorrect: true },
          { id: "c_2", content: "Tissue", isCorrect: false },
          { id: "c_3", content: "Organ", isCorrect: false },
          { id: "c_4", content: "Organ system", isCorrect: false }
        ],
        explanation: "The cell is considered the basic unit of life because it is the smallest structure capable of performing all the processes necessary for life."
      },
      {
        id: "q_2", 
        content: "Which part of the plant cell contains chlorophyll?",
        type: "mcq",
        choices: [
          { id: "c_1", content: "Nucleus", isCorrect: false },
          { id: "c_2", content: "Chloroplast", isCorrect: true },
          { id: "c_3", content: "Mitochondria", isCorrect: false },
          { id: "c_4", content: "Cell wall", isCorrect: false }
        ],
        explanation: "Chloroplasts contain chlorophyll, the green pigment that captures light energy for photosynthesis."
      },
      {
        id: "q_3",
        content: "What characteristic do all living things share?",
        type: "mcq", 
        choices: [
          { id: "c_1", content: "They can move", isCorrect: false },
          { id: "c_2", content: "They reproduce", isCorrect: true },
          { id: "c_3", content: "They are visible", isCorrect: false },
          { id: "c_4", content: "They are large", isCorrect: false }
        ],
        explanation: "All living organisms have the ability to reproduce, ensuring the continuation of their species."
      }
    ]
  };

  const currentQuestion = mockQuizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuizData.totalQuestions) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < mockQuizData.questions.length - 1) {
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
                <CardTitle className="text-2xl mb-2">{mockQuizData.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {mockQuizData.subject}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mockQuizData.timeLimit} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {mockQuizData.totalQuestions} questions
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {mockQuizData.difficulty}
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
                Question {currentQuestionIndex + 1} of {mockQuizData.totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
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
                {currentQuestion.choices.map((choice, index) => (
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
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Explanation (Preview Only)</h4>
                <p className="text-green-700">{currentQuestion.explanation}</p>
                <p className="text-sm text-green-600 mt-2">
                  Correct answer: <strong>{currentQuestion.choices.find(c => c.isCorrect)?.content}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
            {mockQuizData.questions.map((_, index) => (
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
            disabled={currentQuestionIndex === mockQuizData.questions.length - 1}
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