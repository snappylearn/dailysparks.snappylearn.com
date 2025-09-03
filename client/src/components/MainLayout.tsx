import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Target, 
  Trophy, 
  User, 
  Flame,
  Crown,
  Star,
  LogOut,
  ChevronDown,
  Zap,
  Award,
  CreditCard
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Profile, ExaminationSystem, Level } from '@shared/schema';

interface MainLayoutProps {
  children: ReactNode;
}

// Use Profile type from shared schema

export function MainLayout({ children }: MainLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user profile data
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  // Get examination systems and levels
  const { data: examinationSystems = [] } = useQuery<ExaminationSystem[]>({
    queryKey: ['/api/examination-systems'],
    enabled: !!user,
  });

  const currentProfile = profiles?.[0];
  const [selectedExamSystemId, setSelectedExamSystemId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

  // Update selected values when profile loads
  useEffect(() => {
    if (currentProfile) {
      setSelectedExamSystemId(currentProfile.examinationSystemId || '');
      setSelectedLevelId(currentProfile.levelId || '');
    }
  }, [currentProfile]);

  // Get levels for selected examination system
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['/api/levels', selectedExamSystemId],
    enabled: !!selectedExamSystemId,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ examinationSystemId, levelId }: { examinationSystemId?: string; levelId?: string }) => {
      if (!currentProfile) throw new Error('No profile found');
      
      const updateData: any = {};
      if (examinationSystemId !== undefined) updateData.examinationSystemId = examinationSystemId;
      if (levelId !== undefined) updateData.levelId = levelId;
      
      console.log('Updating profile with data:', updateData);
      
      return apiRequest('PATCH', `/api/profiles/${currentProfile.id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
      // Invalidate all profile-dependent queries
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/levels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/terms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-stats'] });
      // Force refetch of any cached data that depends on level
      queryClient.refetchQueries();
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      toast({
        title: "Error",
        description: `Failed to update preferences: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleExaminationSystemChange = (examSystemId: string) => {
    if (!currentProfile) return;
    
    setSelectedExamSystemId(examSystemId);
    
    // Get levels for the new exam system
    const examSystemLevels = levels.filter(level => level.examinationSystemId === examSystemId);
    const firstLevelId = examSystemLevels[0]?.id || '';
    setSelectedLevelId(firstLevelId);
    
    // Update with both exam system and level
    updateProfileMutation.mutate({ 
      examinationSystemId: examSystemId,
      levelId: firstLevelId 
    });
  };

  const handleLevelChange = (levelId: string) => {
    if (!currentProfile) return;
    
    setSelectedLevelId(levelId);
    updateProfileMutation.mutate({ levelId });
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: location === '/' },
    { icon: Zap, label: 'Challenges', path: '/challenges', active: location === '/challenges' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', active: location === '/leaderboard' },
    { icon: Award, label: 'Badges & Trophies', path: '/badges-trophies', active: location === '/badges-trophies' },
    { icon: Target, label: 'Quiz History', path: '/quiz-history', active: location === '/quiz-history' },
    { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions', active: location === '/subscriptions' },
    { icon: User, label: 'Profile', path: '/profile', active: location === '/profile' },
  ];

  // Check if we should show sidebar (dashboard, leaderboard, quiz history, badges, challenges, profile, and subscriptions)
  const showSidebar = location === '/' || location === '/home' || location === '/leaderboard' || location === '/quiz-history' || location === '/badges-trophies' || location === '/challenges' || location === '/subscriptions' || location === '/profile';



  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Top Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Daily Sparks</span>
            </div>

            {/* Center: Navigation Actions & System Selectors */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="default" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Target className="h-4 w-4 mr-2" />
                  Start A Quiz
                </Button>
              </Link>
              
              <Link href="/leaderboard">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              
              {/* Examination System & Level Selectors */}
              {currentProfile && (
                <div className="flex items-center gap-2 ml-4">
                  <Select value={selectedExamSystemId} onValueChange={handleExaminationSystemChange}>
                    <SelectTrigger className="w-28 h-9 text-xs">
                      <SelectValue placeholder="System" />
                    </SelectTrigger>
                    <SelectContent>
                      {examinationSystems.map((system) => (
                        <SelectItem key={system.id} value={system.id}>
                          {system.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedLevelId} onValueChange={handleLevelChange}>
                    <SelectTrigger className="w-24 h-9 text-xs">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.filter(level => level.examinationSystemId === selectedExamSystemId).map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Right: Stats and User Avatar */}
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-purple-600">
                  <Crown className="h-4 w-4" />
                  <span className="font-semibold">#{currentProfile?.rank || '-'}</span>
                </div>
                
                <div className="flex items-center gap-1 text-orange-500">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">{currentProfile?.sparks || 0}</span>
                </div>
                
                <div className="flex items-center gap-1 text-orange-600">
                  <Flame className="h-4 w-4" />
                  <span className="font-semibold">{currentProfile?.currentStreak || currentProfile?.streak || 0}</span>
                </div>
              </div>

              {/* User Avatar with Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any)?.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-400 text-white">
                      {(user as any)?.firstName?.substring(0, 2).toUpperCase() || 'DS'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-gray-100">
                    <div className="font-medium text-sm">{(user as any)?.firstName || 'Student'}</div>
                    <div className="text-xs text-gray-500">{(user as any)?.email}</div>
                  </div>
                  <div className="p-1">
                    <Link href="/profile">
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Settings
                      </button>
                    </Link>
                    <button 
                      onClick={() => window.location.href = '/api/logout'}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Only show on dashboard */}
        {showSidebar && (
          <div className="w-80 bg-white/50 backdrop-blur-sm border-r border-gray-200 p-6">
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
                    <span className="font-semibold text-lg">{currentProfile?.sparks || 0}</span>
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
                    <span className="font-semibold text-lg">#{currentProfile?.rank || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 p-6 ${!showSidebar ? 'max-w-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}