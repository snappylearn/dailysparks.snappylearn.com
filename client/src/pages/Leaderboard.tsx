import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/MainLayout";
import { Crown, Medal, Trophy, Zap, Flame, Target, User } from "lucide-react";

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
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other students</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">See how you rank against other students</p>
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

        {leaderboard.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Yet</h3>
              <p className="text-gray-500">Be the first to take a quiz and claim the top spot!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}