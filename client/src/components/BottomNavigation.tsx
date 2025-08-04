import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { id: 'home', icon: 'fas fa-home', label: 'Home', path: '/' },
    { id: 'progress', icon: 'fas fa-chart-line', label: 'Progress', path: '/progress' },
    { id: 'ranks', icon: 'fas fa-trophy', label: 'Ranks', path: '/leaderboard' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mobile-safe-area">
      <div className="max-w-sm mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                location === item.path ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <i className={`${item.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
