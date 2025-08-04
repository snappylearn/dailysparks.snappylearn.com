import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Target, 
  Trophy, 
  User, 
  Flame,
  Crown,
  Star,
  LogOut
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

interface Profile {
  id: string;
  name: string;
  totalSparks: number;
  currentStreak: number;
  examinationSystem: string;
  level: string;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Get user profile data
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  const currentProfile = profiles?.[0];

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: location === '/' },
    { icon: Target, label: 'Quiz', path: '/quiz', active: location.startsWith('/quiz') },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', active: location === '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile', active: location === '/profile' },
  ];

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Top Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Greeting */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Hey there, {currentProfile?.name || user?.firstName || 'Student'}!
                </h1>
                <p className="text-sm text-gray-600">Ready to earn some sparks today?</p>
              </div>
            </div>

            {/* Right: Stats and Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="h-4 w-4" />
                    <span className="font-semibold">{currentProfile?.totalSparks || 0}</span>
                  </div>
                  <div className="text-xs text-gray-500">Sparks</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-orange-600">
                    <Flame className="h-4 w-4" />
                    <span className="font-semibold">{currentProfile?.currentStreak || 0}</span>
                  </div>
                  <div className="text-xs text-gray-500">Day streak</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Right Sidebar */}
        <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-3">
                {navigationItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12 text-left"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Total Sparks
                  </span>
                  <span className="font-semibold text-lg">{currentProfile?.totalSparks || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Current Streak
                  </span>
                  <span className="font-semibold text-lg">{currentProfile?.currentStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Crown className="h-4 w-4 text-purple-500" />
                    Today's Rank
                  </span>
                  <span className="font-semibold text-lg">#47</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}