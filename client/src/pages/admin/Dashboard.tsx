import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, BookOpen, TrendingUp, Award, Clock, Target } from "lucide-react";

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/metrics"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/admin/recent-activity"],
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/admin/leaderboard"],
  });

  if (metricsLoading || activityLoading || leaderboardLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Mon", quizzes: 24 },
    { name: "Tue", quizzes: 35 },
    { name: "Wed", quizzes: 28 },
    { name: "Thu", quizzes: 42 },
    { name: "Fri", quizzes: 38 },
    { name: "Sat", quizzes: 31 },
    { name: "Sun", quizzes: 27 },
  ];

  const subjectData = [
    { name: "Mathematics", value: 35, color: "#8884d8" },
    { name: "English", value: 25, color: "#82ca9d" },
    { name: "Science", value: 20, color: "#ffc658" },
    { name: "History", value: 12, color: "#ff7300" },
    { name: "Geography", value: 8, color: "#00ff00" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 2,847}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalQuizzes || 142}</div>
            <p className="text-xs text-muted-foreground">
              +8 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalSessions || 18,435}</div>
            <p className="text-xs text-muted-foreground">
              +18% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgScore || 78}%</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Quiz Activity Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quiz Activity</CardTitle>
            <CardDescription>Daily quiz sessions over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quizzes" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Most popular subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity?.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity?.action || `New quiz session started`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {activity?.user || `Student #${Math.floor(Math.random() * 1000)}`} • {activity?.time || '2 minutes ago'}
                  </p>
                </div>
                <Badge variant="outline">{activity?.type || 'Session'}</Badge>
              </div>
            )) || [...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    New quiz session started
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Student #{Math.floor(Math.random() * 1000)} • {Math.floor(Math.random() * 60)} minutes ago
                  </p>
                </div>
                <Badge variant="outline">Session</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Students with highest scores this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaderboard?.slice(0, 5).map((student: any, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student?.avatar} />
                  <AvatarFallback>{student?.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student?.name || `Student ${index + 1}`}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {student?.sparks || Math.floor(Math.random() * 1000) + 500} sparks
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{student?.score || Math.floor(Math.random() * 20) + 80}%</span>
                </div>
              </div>
            )) || [...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Student {index + 1}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {Math.floor(Math.random() * 1000) + 500} sparks
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 20) + 80}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}