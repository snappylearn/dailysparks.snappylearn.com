import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/MainLayout";
import { Crown, Medal, Trophy, Zap, Flame, Target, User, Award, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  sparks: number;
  streak: number;
  quizzesCompleted: number;
  averageScore: number;
  lastActive: string;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'overall' | 'today'>('today');
  
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', filterType],
    queryFn: () => fetch(`/api/leaderboard/${filterType}`).then(res => res.json()),
  });

  // Fetch badges and trophies with badgeType information
  const { data: badges = [] } = useQuery({
    queryKey: ['/api/badges'],
    queryFn: () => fetch('/api/badges').then(res => res.json()),
  });

  const { data: trophies = [] } = useQuery({
    queryKey: ['/api/trophies'],
    queryFn: () => fetch('/api/trophies').then(res => res.json()),
  });

  // Fetch user's earned badges and trophies
  const { data: userBadges = [] } = useQuery<any[]>({
    queryKey: ['/api/user', user?.id, 'badges'],
    queryFn: () => fetch(`/api/user/${user?.id}/badges`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const { data: userTrophies = [] } = useQuery<any[]>({
    queryKey: ['/api/user', user?.id, 'trophies'],
    queryFn: () => fetch(`/api/user/${user?.id}/trophies`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Helper function to check if badge is earned in current period
  const isBadgeEarnedInPeriod = (userBadge: any, badgeTypeTitle: string) => {
    if (!userBadge || !userBadge.lastEarnedAt) return false;
    
    const lastEarned = new Date(userBadge.lastEarnedAt);
    const now = new Date();
    
    // For Daily badges - check if earned today
    if (badgeTypeTitle.toLowerCase().includes('daily')) {
      return lastEarned.toDateString() === now.toDateString();
    }
    
    // For Weekly badges - check if earned this week
    if (badgeTypeTitle.toLowerCase().includes('weekly')) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return lastEarned >= startOfWeek;
    }
    
    // For Monthly badges - check if earned this month
    if (badgeTypeTitle.toLowerCase().includes('monthly')) {
      return lastEarned.getMonth() === now.getMonth() && 
             lastEarned.getFullYear() === now.getFullYear();
    }
    
    // For all other badges - once earned, always shown
    return true;
  };

  // Create maps for badge status
  const userBadgeRecords = new Map(userBadges.map(ub => [ub.badgeId, ub]));
  const earnedBadgeIds = new Set(
    badges
      .filter((badge: any) => {
        const userBadge = userBadgeRecords.get(badge.id);
        if (!userBadge) return false;
        const badgeTypeTitle = badge.badgeType?.title || '';
        return isBadgeEarnedInPeriod(userBadge, badgeTypeTitle);
      })
      .map((badge: any) => badge.id)
  );
  const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub.count || 1]));

  // Create maps for trophy status
  const earnedTrophyIds = new Set(userTrophies.map((ut: any) => ut.trophyId));
  const userTrophyMap = new Map(userTrophies.map((ut: any) => [ut.trophyId, ut.count || 1]));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Trophy className="h-6 w-6 text-orange-500 mr-3" />
                Leaderboard {filterType === 'today' ? 'Today' : 'Overall'}
              </h2>
              <p className="text-gray-600">See how you rank against other students</p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={filterType === 'today' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterType === 'today'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Today
              </Button>
              <Button
                variant={filterType === 'overall' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('overall')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterType === 'overall'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overall
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section - matching homepage style */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Trophy className="h-6 w-6 text-orange-500 mr-3" />
              Leaderboard {filterType === 'today' ? 'Today' : 'Overall'}
            </h2>
            <p className="text-gray-600">See how you rank against other students</p>
          </div>
          
          {/* Filter Controls */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={filterType === 'overall' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('overall')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === 'overall'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overall
            </Button>
            <Button
              variant={filterType === 'today' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === 'today'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <Card className="border-gray-300">
              <CardContent className="p-4 text-center">
                <div className="mb-3">
                  <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    {leaderboard[1].profileImageUrl ? (
                      <img
                        src={leaderboard[1].profileImageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{leaderboard[1].firstName}</h3>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{leaderboard[1].sparks}</span>
                </div>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="border-yellow-300 shadow-lg transform scale-105">
              <CardContent className="p-4 text-center">
                <div className="mb-3">
                  <Crown className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    {leaderboard[0].profileImageUrl ? (
                      <img
                        src={leaderboard[0].profileImageUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">{leaderboard[0].firstName}</h3>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="font-bold">{leaderboard[0].sparks}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="border-amber-300">
              <CardContent className="p-4 text-center">
                <div className="mb-3">
                  <Trophy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="w-16 h-16 bg-amber-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                    {leaderboard[2].profileImageUrl ? (
                      <img
                        src={leaderboard[2].profileImageUrl}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-amber-700" />
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{leaderboard[2].firstName}</h3>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{leaderboard[2].sparks}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <Card key={entry.userId} className={`transition-all hover:shadow-md ${index < 3 ? 'bg-gradient-to-r from-orange-50 to-yellow-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {entry.profileImageUrl ? (
                        <img
                          src={entry.profileImageUrl}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {entry.firstName} {entry.lastName?.charAt(0)}.
                      </h3>
                      <p className="text-sm text-gray-500">
                        {entry.quizzesCompleted} quizzes completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-lg">{entry.sparks}</span>
                      </div>
                      <p className="text-xs text-gray-500">Sparks</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Flame className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-lg">{entry.streak}</span>
                      </div>
                      <p className="text-xs text-gray-500">Streak</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-lg">{entry.averageScore}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Avg Score</p>
                    </div>

                    <Badge className={getRankBadgeColor(entry.rank)}>
                      #{entry.rank}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {leaderboard.length === 0 && filterType === 'today' && (
          <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <Star className="h-20 w-20 text-blue-400 mx-auto mb-3 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-3">
                🎉 You're the First! 🎉
              </h3>
              <p className="text-lg text-blue-700 mb-2">
                Congratulations! No one has taken a quiz today yet.
              </p>
              <p className="text-blue-600 mb-6">
                Be the trailblazer and set the pace for everyone else!
              </p>
              <Button 
                onClick={() => window.location.href = '/home'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                data-testid="button-take-first-quiz"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Take a Quiz Now
              </Button>
              <p className="text-sm text-blue-500 mt-4">
                Claim your spot at the top of today's leaderboard! 🚀
              </p>
            </CardContent>
          </Card>
        )}

        {leaderboard.length === 0 && filterType === 'overall' && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Yet</h3>
              <p className="text-gray-500">Be the first to take a quiz and claim the top spot!</p>
            </CardContent>
          </Card>
        )}

        {/* Inline Badges and Trophies below leaderboard */}
        {(badges.length > 0 || trophies.length > 0) && (
          <div className="mt-6 space-y-4">
            {/* Badges Row */}
            {badges.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium text-gray-900">Available Badges</h4>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {badges.map((badge: any) => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    const earnedCount = userBadgeMap.get(badge.id) || 0;
                    
                    return (
                      <div 
                        key={badge.id} 
                        className={`flex-shrink-0 rounded-lg border p-3 text-center min-w-[120px] transition-all ${
                          isEarned 
                            ? 'bg-yellow-50 border-yellow-200 shadow-sm' 
                            : 'bg-white border-gray-200 opacity-60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 relative ${
                          isEarned ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-xl">{badge.icon || '🏆'}</span>
                          {earnedCount > 1 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                              {earnedCount}
                            </div>
                          )}
                        </div>
                        <h5 className={`font-medium text-xs mb-1 ${isEarned ? 'text-yellow-900' : 'text-gray-600'}`}>
                          {badge.title}
                        </h5>
                        {isEarned && (
                          <div className="text-[10px] text-yellow-600 mb-1">
                            {badge.badgeType?.title?.toLowerCase().includes('daily') ? '✓ Today' :
                             badge.badgeType?.title?.toLowerCase().includes('weekly') ? '✓ This Week' :
                             badge.badgeType?.title?.toLowerCase().includes('monthly') ? '✓ This Month' :
                             '✓ Earned'}
                          </div>
                        )}
                        {badge.sparks && (
                          <div className="flex items-center justify-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            <span className="text-xs font-medium text-orange-600">{badge.sparks}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trophies Row */}
            {trophies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <h4 className="font-medium text-gray-900">Achievement Trophies</h4>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {trophies.map((trophy: any) => {
                    const isEarned = earnedTrophyIds.has(trophy.id);
                    const earnedCount = userTrophyMap.get(trophy.id) || 0;
                    
                    return (
                      <div 
                        key={trophy.id} 
                        className={`flex-shrink-0 rounded-lg border p-3 text-center min-w-[100px] transition-all ${
                          isEarned
                            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-sm'
                            : 'bg-white border-gray-200 opacity-60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 relative ${
                          isEarned ? 'bg-amber-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-xl">{trophy.icon || '🏆'}</span>
                          {earnedCount > 1 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                              {earnedCount}
                            </div>
                          )}
                        </div>
                        <h5 className={`font-medium text-xs ${isEarned ? 'text-amber-900' : 'text-gray-600'}`}>
                          {trophy.title}
                        </h5>
                        {isEarned && (
                          <div className="text-[10px] text-amber-600 mt-1">✓ Earned</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}