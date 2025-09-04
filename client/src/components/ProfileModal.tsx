import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user } = useAuth();

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      // Redirect to landing page after successful logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-w-sm mx-auto transform transition-transform duration-300">
        <div className="p-4">
          {/* Handle */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-white text-2xl"></i>
              )}
            </div>
            <h3 className="font-semibold text-lg text-gray-900 font-poppins">
              {user?.firstName || user?.email || "Student"}
            </h3>
            <p className="text-gray-600 text-sm">
              {user?.school ? `${user.school} • ` : ""}{user?.form || "Form 1"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{user?.sparks || 0}</div>
              <div className="text-xs text-gray-600">Total Sparks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-500">{stats?.totalQuizzes || 0}</div>
              <div className="text-xs text-gray-600">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats?.averageScore || 0}%</div>
              <div className="text-xs text-gray-600">Average</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-700">Edit Profile</span>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-700">Settings</span>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
              <span className="font-medium text-orange-500">Upgrade to Premium</span>
              <i className="fas fa-crown text-orange-500"></i>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <span className="font-medium text-red-500">Logout</span>
              <i className="fas fa-sign-out-alt text-red-500"></i>
            </button>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full py-3 text-gray-500 font-medium"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
