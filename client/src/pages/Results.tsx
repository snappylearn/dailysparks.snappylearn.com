import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Results() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Fetch quiz results
  const { data: resultsData, isLoading } = useQuery({
    queryKey: ["/api/quiz", sessionId, "results"],
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-teal-50">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <i className="fas fa-fire text-white text-2xl"></i>
        </div>
      </div>
    );
  }

  // Mock results data for demo
  const mockResults = {
    score: "24/30",
    percentage: 80,
    grade: "B+",
    sparksEarned: 300,
    currentStreak: user?.streak || 24,
    totalSparks: user?.sparks || 1247,
  };

  const results = resultsData || mockResults;

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-green-400 to-teal-400 text-white p-4 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce-soft">
            <i className="fas fa-trophy text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold mb-2 font-poppins">🎉 Quiz Complete!</h1>
          <p className="opacity-90">Great job on your mathematics quiz!</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="max-w-sm mx-auto p-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Score Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2 font-poppins">{results.score}</div>
            <div className="text-xl font-semibold text-teal-500 mb-1">{results.percentage}%</div>
            <div className="text-lg font-medium text-gray-600">Grade: {results.grade}</div>
          </div>

          {/* Rewards Earned */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">💎 Sparks Earned</span>
              <span className="text-2xl font-bold text-orange-500 animate-pulse">+{results.sparksEarned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">🔥 Streak</span>
              <span className="text-lg font-bold streak-fire">{results.currentStreak} days!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setLocation("/")}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-3 font-semibold transform hover:scale-105 transition-all duration-200"
            >
              Try Another Topic
            </Button>
            <Button 
              variant="outline"
              className="w-full border-2 border-teal-400 text-teal-500 hover:bg-teal-400 hover:text-white py-3 font-semibold transition-all duration-200"
            >
              View Explanations
            </Button>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 font-poppins">📊 Your Performance</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Algebra</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs font-semibold text-green-500">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Geometry</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-xs font-semibold text-yellow-500">70%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-700">Statistics</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-xs font-semibold text-orange-500">60%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
