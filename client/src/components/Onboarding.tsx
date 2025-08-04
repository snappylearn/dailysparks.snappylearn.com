import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Onboarding() {
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [school, setSchool] = useState("");
  const { toast } = useToast();

  const onboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/onboarding", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Daily Sparks!",
        description: "Your account has been set up successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedExam || !selectedForm) {
      toast({
        title: "Missing Information",
        description: "Please select both exam type and form level.",
        variant: "destructive",
      });
      return;
    }

    onboardingMutation.mutate({
      examType: selectedExam,
      form: selectedForm,
      school: school || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-100 via-white to-teal-50">
      <div className="max-w-sm w-full space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center spark-glow animate-pulse-slow">
            <i className="fas fa-fire text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">Daily Sparks</h1>
          <p className="text-gray-600 text-sm">Make revision as addictive as TikTok</p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">I'm preparing for:</h2>
          </div>

          {/* Exam Type Selection */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setSelectedExam("KCSE")}
              className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedExam === "KCSE" 
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              KCSE
            </button>
            <button 
              onClick={() => setSelectedExam("IGCSE")}
              className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedExam === "IGCSE" 
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              IGCSE
            </button>
            <button 
              onClick={() => setSelectedExam("KPSEA")}
              className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedExam === "KPSEA" 
                  ? "bg-orange-500 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              KPSEA
            </button>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 font-poppins">My Form/Grade:</h3>
          </div>

          {/* Form Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setSelectedForm("Form 1")}
              className={`py-4 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedForm === "Form 1" 
                  ? "bg-teal-400 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Form 1
            </button>
            <button 
              onClick={() => setSelectedForm("Form 2")}
              className={`py-4 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedForm === "Form 2" 
                  ? "bg-teal-400 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Form 2
            </button>
            <button 
              onClick={() => setSelectedForm("Form 3")}
              className={`py-4 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedForm === "Form 3" 
                  ? "bg-teal-400 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Form 3
            </button>
            <button 
              onClick={() => setSelectedForm("Form 4")}
              className={`py-4 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedForm === "Form 4" 
                  ? "bg-teal-400 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Form 4
            </button>
          </div>

          {/* Optional School Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School (Optional)
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Enter your school name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Start Button */}
          <Button 
            onClick={handleSubmit}
            disabled={onboardingMutation.isPending || !selectedExam || !selectedForm}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-4 text-lg font-semibold font-poppins transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {onboardingMutation.isPending ? "Setting up..." : "Let's Start! 🚀"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            *Add your school later for leaderboards
          </p>
        </div>
      </div>
    </div>
  );
}
