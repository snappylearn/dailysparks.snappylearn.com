import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Profile, Subject } from "@shared/schema";
import { Book, Flame, Zap, TrendingUp, Plus } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  // Get user profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const currentProfile = profiles[0]; // Use first profile for now

  // Get subjects for current profile's examination system
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects', currentProfile?.examinationSystemId],
    enabled: !!currentProfile?.examinationSystemId,
  });

  if (profilesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <p className="text-gray-600">Loading your profiles...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Learning Profiles Found</CardTitle>
            <CardDescription>
              You need to create a learning profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Hey there, {user?.firstName || 'Student'}!
                </h1>
                <p className="text-sm text-gray-600">
                  Ready to earn some sparks today?
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-lg font-bold text-gray-900">{currentProfile.sparks || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Sparks</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="text-lg font-bold text-gray-900">{currentProfile.streak || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Day streak</p>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* All Subjects */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-orange-500 mr-2" />
            Choose Your Subject
          </h2>
          <p className="text-gray-600 mb-6">Select a subject to start your quiz</p>
          
          {subjects.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-2 hover:border-orange-300 bg-white"
                  onClick={() => {
                    console.log('Clicking subject card:', subject.name, subject.id);
                    window.location.href = `/quiz?subject=${subject.id}&name=${encodeURIComponent(subject.name)}`;
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: subject.color || '#666' }}
                    >
                      {subject.name.charAt(0)}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm leading-tight">
                      {subject.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mb-6">
              <CardContent className="text-center py-8">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No subjects available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Your Progress</span>
              </CardTitle>
              <CardDescription>
                See how well you're doing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Take your first quiz to see your progress!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5" />
              <span>Welcome to Daily Sparks!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100">
              Your profile-based learning platform is now ready. Start taking quizzes to earn sparks and build your learning streaks!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}