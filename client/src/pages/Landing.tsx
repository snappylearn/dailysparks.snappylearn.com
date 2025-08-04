import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center spark-glow animate-pulse-slow">
          <i className="fas fa-fire text-white text-3xl"></i>
        </div>

        {/* Hero Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 font-poppins">
            Daily Sparks
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Dead Simple AI Revision Platform
          </p>
          <p className="text-gray-500">
            Make revision as addictive as TikTok, as effective as private tutoring
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <i className="fas fa-brain text-orange-500 text-sm"></i>
            </div>
            <span className="text-gray-700">AI-powered question selection</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <i className="fas fa-gamepad text-teal-500 text-sm"></i>
            </div>
            <span className="text-gray-700">Gamified learning experience</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-graduation-cap text-blue-500 text-sm"></i>
            </div>
            <span className="text-gray-700">KCSE curriculum aligned</span>
          </div>
        </div>

        {/* CTA */}
        <Button 
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-4 text-lg font-semibold font-poppins transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Start Your Journey 🚀
        </Button>

        <p className="text-xs text-gray-500">
          Join thousands of Kenyan students achieving their dream grades
        </p>
      </div>
    </div>
  );
}
