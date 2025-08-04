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
  Star
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

interface Profile {
  id: string;
  name: string;
  totalSparks: number;
  currentStreak: number;
  examinationSystem: string;
  level: string;
}

interface DailyRanking {
  position: number;
  totalParticipants: number;
  todaysSparks: number;
}

export function MainLayout({ children, showNavigation = true }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Get user profile data
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  // Get daily ranking (mock for now)
  const dailyRanking: DailyRanking = {
    position: 47,
    totalParticipants: 2341,
    todaysSparks: 180
  };

  const currentProfile = profiles?.[0];

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: location === '/' },
    { icon: Target, label: 'Quiz', path: '/quiz', active: location.startsWith('/quiz') },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', active: location === '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile', active: location === '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Top Bar with Daily Spark Ranking */}
      {isAuthenticated && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Daily Spark Ranking */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold">
                  <Flame className="h-4 w-4" />
                  Daily Spark #{dailyRanking.position}
                </div>
                <div className="text-sm text-gray-600 hidden sm:block">
                  {dailyRanking.todaysSparks} sparks today
                </div>
              </div>

              {/* Right: User Profile */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{currentProfile?.name || user?.firstName || 'Student'}</div>
                    <div className="text-xs text-gray-500">
                      {currentProfile?.totalSparks || 0} total sparks
                    </div>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback>
                      {currentProfile?.name?.substring(0, 2).toUpperCase() || user?.firstName?.substring(0, 2).toUpperCase() || 'DS'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 p-4">
          {children}
        </main>

        {/* Bottom Navigation for Mobile / Sidebar for Desktop */}
        {showNavigation && isAuthenticated && (
          <>
            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-orange-200">
              <div className="flex items-center justify-around py-2">
                {navigationItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      size="sm"
                      className="flex flex-col gap-1 h-auto py-2 px-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 p-4">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={item.active ? "default" : "ghost"}
                          className="w-full justify-start gap-3"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Stats Card */}
                  {currentProfile && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-700 mb-3">Quick Stats</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            Total Sparks
                          </span>
                          <span className="font-medium">{currentProfile?.totalSparks || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Flame className="h-3 w-3 text-orange-500" />
                            Current Streak
                          </span>
                          <span className="font-medium">{currentProfile?.currentStreak || 0} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Crown className="h-3 w-3 text-purple-500" />
                            Today's Rank
                          </span>
                          <span className="font-medium">#{dailyRanking.position}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Add padding bottom for mobile navigation */}
      {showNavigation && isAuthenticated && (
        <div className="h-20 lg:h-0" />
      )}
    </div>
  );
}