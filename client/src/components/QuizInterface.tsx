import { Button } from "@/components/ui/button";

interface QuizInterfaceProps {
  question: any;
  questionNumber: number;
  totalQuestions: number;
  progressPercentage: number;
  onAnswerSelect: (answer: string) => void;
  selectedAnswer?: string;
  isSubmitting?: boolean;
}

export default function QuizInterface({
  question,
  questionNumber,
  totalQuestions,
  progressPercentage,
  onAnswerSelect,
  selectedAnswer,
  isSubmitting = false,
}: QuizInterfaceProps) {
  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fire text-white text-2xl"></i>
        </div>
      </div>
    );
  }

  const options = [
    { letter: 'A', text: question.optionA },
    { letter: 'B', text: question.optionB },
    { letter: 'C', text: question.optionC },
    { letter: 'D', text: question.optionD },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Quiz Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-sm mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-sm font-medium text-orange-500">Mathematics</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-sm mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
              {question.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.letter}
                onClick={() => !isSubmitting && onAnswerSelect(option.letter)}
                disabled={isSubmitting}
                className={`w-full text-left p-4 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  selectedAnswer === option.letter
                    ? "border-teal-400 bg-teal-50"
                    : "border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed transform-none" : ""}`}
              >
                <span className={`font-semibold mr-3 ${
                  selectedAnswer === option.letter ? "text-teal-500" : "text-orange-500"
                }`}>
                  {option.letter})
                </span>
                <span className="text-gray-700">{option.text}</span>
                {selectedAnswer === option.letter && (
                  <i className="fas fa-check text-teal-500 float-right mt-1"></i>
                )}
              </button>
            ))}
          </div>

          {/* Reward Indicator */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center bg-yellow-100 text-orange-500 px-4 py-2 rounded-full">
              <i className="fas fa-gem mr-2"></i>
              <span className="font-semibold text-sm">+10 sparks per correct answer</span>
            </div>
          </div>
        </div>

        {/* Next Button - Only show if answer is selected */}
        {selectedAnswer && (
          <Button 
            onClick={() => onAnswerSelect(selectedAnswer)}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-4 text-lg font-semibold font-poppins transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Submitting...
              </>
            ) : (
              "Next Question →"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
