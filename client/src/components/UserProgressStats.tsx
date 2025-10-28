import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle, Trophy, Flame, Zap } from "lucide-react";

interface UserStats {
  totalSparks: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
}

interface UserProgressStatsProps {
  variant?: 'default' | 'compact';
}

export function UserProgressStats({ variant = 'default' }: UserProgressStatsProps) {
  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/user-stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!userStats) {
    return null;
  }

  const stats = [
    {
      label: 'Total Sparks',
      value: userStats.totalSparks,
      icon: Zap,
      iconColor: 'text-orange-500',
      testId: 'stat-total-sparks'
    },
    {
      label: 'Quizzes Completed',
      value: userStats.totalQuizzes,
      icon: Target,
      iconColor: 'text-blue-500',
      testId: 'stat-total-quizzes'
    },
    {
      label: 'Average Score',
      value: `${userStats.averageScore}%`,
      icon: Trophy,
      iconColor: 'text-yellow-500',
      testId: 'stat-average-score'
    },
    {
      label: 'Current Streak',
      value: userStats.currentStreak,
      icon: Flame,
      iconColor: 'text-green-500',
      testId: 'stat-current-streak'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center" data-testid={stat.testId}>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} data-testid={stat.testId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
