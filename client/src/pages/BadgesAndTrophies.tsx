import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function BadgesAndTrophies() {
  const { user } = useAuth();

  // Fetch all badges
  const { data: badges = [] } = useQuery<any[]>({
    queryKey: ['/api/badges'],
  });

  // Fetch all trophies
  const { data: trophies = [] } = useQuery<any[]>({
    queryKey: ['/api/trophies'],
  });

  // Fetch user badges
  const { data: userBadges = [] } = useQuery<any[]>({
    queryKey: ['/api/user', user?.id, 'badges'],
    enabled: !!user?.id,
  });

  // Get earned badge IDs for easy lookup
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Badges & Trophies</h1>
          <p className="text-gray-600 mt-2">Track your achievements and unlock new rewards</p>
        </div>

        {/* User Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{userBadges.length}</h3>
              <p className="text-sm text-gray-600">Badges Earned</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{trophies.length}</h3>
              <p className="text-sm text-gray-600">Trophies Available</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{Math.round((userBadges.length / badges.length) * 100)}%</h3>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievement Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge: any) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <div 
                    key={badge.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      isEarned 
                        ? 'bg-yellow-50 border-yellow-200 shadow-md' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isEarned ? 'bg-yellow-100' : 'bg-gray-200'
                      }`}>
                        <span className="text-2xl">{badge.icon || '🏆'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${isEarned ? 'text-yellow-800' : 'text-gray-600'}`}>
                            {badge.title}
                          </h3>
                          {isEarned && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Earned
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${isEarned ? 'text-yellow-700' : 'text-gray-500'}`}>
                          {badge.description}
                        </p>
                        {badge.sparks && (
                          <div className="flex items-center gap-1 mt-2">
                            <Zap className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600">+{badge.sparks} sparks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trophies Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Achievement Trophies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trophies.map((trophy: any) => (
                <div 
                  key={trophy.id}
                  className="p-4 rounded-lg border bg-amber-50 border-amber-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{trophy.icon || '🏆'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-amber-800 mb-1">{trophy.title}</h3>
                      <p className="text-sm text-amber-700">{trophy.description}</p>
                      <Badge variant="outline" className="mt-2 border-amber-300 text-amber-700">
                        Available
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}