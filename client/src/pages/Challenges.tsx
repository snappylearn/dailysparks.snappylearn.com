import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Zap, Clock, CheckCircle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Challenges() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch all challenges
  const { data: challenges = [] } = useQuery<any[]>({
    queryKey: ['/api/challenges'],
  });

  // Fetch user challenge progress
  const { data: userChallenges = [] } = useQuery<any[]>({
    queryKey: ['/api/user', user?.id, 'challenges'],
    enabled: !!user?.id,
  });

  // Get today's challenge
  const { data: todayChallenge } = useQuery<any>({
    queryKey: ['/api/challenge/today'],
    enabled: !!user?.id,
  });

  // Create a map of user progress
  const userProgressMap = new Map(
    userChallenges.map(uc => [uc.challengeId, uc])
  );

  const activeChallenges = challenges.filter(c => c.isActive);
  const completedChallenges = userChallenges.filter(uc => uc.completed);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Challenges</h1>
          <p className="text-gray-600 mt-2">Complete challenges to earn sparks and unlock badges</p>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{activeChallenges.length}</h3>
              <p className="text-sm text-gray-600">Active Challenges</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">{completedChallenges.length}</h3>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">
                {completedChallenges.reduce((total, uc) => {
                  const challenge = challenges.find(c => c.id === uc.challengeId);
                  return total + (challenge?.sparks || 0);
                }, 0)}
              </h3>
              <p className="text-sm text-gray-600">Sparks Earned</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-gray-900">
                {Math.round((completedChallenges.length / activeChallenges.length) * 100) || 0}%
              </h3>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Featured Challenge */}
        {todayChallenge && (
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="h-5 w-5" />
                Today's Featured Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-orange-900">{todayChallenge.title}</h3>
                  <p className="text-orange-700">{todayChallenge.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Zap className="h-4 w-4" />
                      <span className="font-medium">{todayChallenge.sparks} sparks</span>
                    </div>
                    {todayChallenge.streaks > 0 && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">+{todayChallenge.streaks} streak</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => setLocation('/home')}
                    data-testid="button-start-featured-challenge"
                  >
                    Start Challenge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              All Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeChallenges.map((challenge: any) => {
                const userProgress = userProgressMap.get(challenge.id);
                const isCompleted = userProgress?.completed || false;
                const sparksAwarded = userProgress?.sparksAwarded || false;
                const progress = userProgress?.progress || 0;
                const completedAt = userProgress?.completedAt;
                
                // Check if it's a daily challenge and was completed today
                const isDailyChallenge = challenge.id.includes('daily');
                const wasCompletedToday = completedAt && 
                  new Date(completedAt).toDateString() === new Date().toDateString();
                
                // Calculate progress percentage based on challenge target
                const targetValue = challenge.targetValue || 100; // Default to 100 if not set
                const progressPercentage = Math.min((progress / targetValue) * 100, 100);

                return (
                  <div 
                    key={challenge.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCompleted && wasCompletedToday
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${
                            isCompleted && wasCompletedToday ? 'text-green-800' : 'text-gray-900'
                          }`}>
                            {challenge.title}
                          </h3>
                          {isCompleted && wasCompletedToday && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed {isDailyChallenge ? 'Today' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-3 ${
                          isCompleted && wasCompletedToday ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {challenge.description}
                        </p>
                        
                        {(!isCompleted || !wasCompletedToday) && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress (Auto-Tracked)</span>
                              <span className="font-medium">{progress} / {targetValue} sparks earned</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}
                        
                        {isCompleted && wasCompletedToday && sparksAwarded && (
                          <div className="mb-3 bg-green-100 border border-green-200 rounded-md p-2">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-green-600" />
                              <strong>Reward Claimed:</strong> +{challenge.sparks} sparks added to your account!
                              {isDailyChallenge && <span className="ml-2 text-xs">(Resets tomorrow)</span>}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-orange-600">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {challenge.sparks} sparks reward
                            </span>
                          </div>
                          
                          {challenge.streaks > 0 && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Trophy className="h-4 w-4" />
                              <span className="text-sm font-medium">+{challenge.streaks} streak</span>
                            </div>
                          )}
                          
                          {challenge.badgeId && (
                            <Badge variant="outline" className="text-xs">
                              Badge Reward
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {isCompleted && wasCompletedToday ? (
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            disabled
                            data-testid={`button-completed-challenge-${challenge.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </Button>
                        ) : (
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">Auto-Tracked</div>
                            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium">
                              {Math.round(progressPercentage)}%
                            </div>
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
      </div>
    </MainLayout>
  );
}