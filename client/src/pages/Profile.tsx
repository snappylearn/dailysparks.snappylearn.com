import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/MainLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Settings, 
  Award, 
  Trophy, 
  Target, 
  Flame, 
  Star,
  Crown,
  BookOpen,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Profile as ProfileType, ExaminationSystem, Level } from '@shared/schema';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Get user profile data
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<ProfileType[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  // Get user stats
  const { data: userStats } = useQuery<{
    totalSparks: number;
    totalQuizzes: number;
    averageScore: number;
    currentStreak: number;
  }>({
    queryKey: ['/api/user-stats'],
    enabled: !!user,
  });

  // Get examination systems
  const { data: examinationSystems = [] } = useQuery<ExaminationSystem[]>({
    queryKey: ['/api/examination-systems'],
    enabled: !!user && isEditing,
  });

  // Get levels for selected examination system
  const currentProfile = profiles[0];
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: ['/api/levels', currentProfile?.examinationSystemId],
    enabled: !!currentProfile?.examinationSystemId && isEditing,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { examinationSystemId?: string; levelId?: string }) => {
      if (!currentProfile) throw new Error('No profile found');
      return await apiRequest(`/api/profiles/${currentProfile.id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const examinationSystemId = formData.get('examinationSystemId') as string;
    const levelId = formData.get('levelId') as string;
    
    updateProfileMutation.mutate({
      ...(examinationSystemId && { examinationSystemId }),
      ...(levelId && { levelId }),
    });
  };

  if (profilesLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentProfile) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>No Profile Found</CardTitle>
              <CardDescription>
                You need to create a profile to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-400"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const currentExamSystem = examinationSystems.find(es => es.id === currentProfile.examinationSystemId);
  const currentLevel = levels.find(l => l.id === currentProfile.levelId);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your learning profile and track your progress</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className={!isEditing ? "bg-gradient-to-r from-orange-500 to-yellow-400" : ""}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profileImageUrl ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-400 text-white text-lg">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="secondary" className="flex items-center">
                        <Crown className="h-3 w-3 mr-1" />
                        {user?.isPremium ? 'Premium' : 'Free'}
                      </Badge>
                      {user?.isPremium && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white">
                          ${user.credits} Credits
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education Settings */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Education Settings</h4>
                  {!isEditing ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Examination System:</span>
                        <span className="font-medium">{currentExamSystem?.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Level:</span>
                        <span className="font-medium">{currentLevel?.title || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Term:</span>
                        <span className="font-medium">{currentProfile.currentTerm || 'Term 1'}</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSave} className="space-y-4">
                      <div>
                        <Label htmlFor="examinationSystemId">Examination System</Label>
                        <Select name="examinationSystemId" defaultValue={currentProfile.examinationSystemId ?? ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select examination system" />
                          </SelectTrigger>
                          <SelectContent>
                            {examinationSystems.map((system) => (
                              <SelectItem key={system.id} value={system.id}>
                                {system.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="levelId">Level</Label>
                        <Select name="levelId" defaultValue={currentProfile.levelId ?? ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((level) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-orange-500 to-yellow-400"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{userStats?.totalSparks || 0}</div>
                    <div className="text-sm text-gray-600">Total Sparks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{userStats?.totalQuizzes || 0}</div>
                    <div className="text-sm text-gray-600">Quizzes Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{userStats?.averageScore || 0}%</div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{userStats?.currentStreak || 0}</div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Flame className="h-4 w-4 mr-1 text-orange-500" />
                    Sparks
                  </span>
                  <span className="font-semibold text-orange-500">{currentProfile.sparks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Target className="h-4 w-4 mr-1 text-green-500" />
                    Streak
                  </span>
                  <span className="font-semibold text-green-500">{currentProfile.streak}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    Rank
                  </span>
                  <span className="font-semibold">{currentProfile.rank || 'Unranked'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                    Last Active
                  </span>
                  <span className="text-sm">
                    {currentProfile.lastActivity ? new Date(currentProfile.lastActivity).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/quiz-history'}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Quiz History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/leaderboard'}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/badges-trophies'}
                >
                  <Award className="h-4 w-4 mr-2" />
                  My Achievements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}