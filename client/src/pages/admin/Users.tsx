import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Mail, Calendar, Trophy, Zap, TrendingUp, Eye, Ban, Settings } from "lucide-react";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users", { search: searchQuery, status: statusFilter, sort: sortBy }],
  });

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchQuery === "" || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getExamSystemBadge = (system: string) => {
    const colors = {
      'KCSE': 'bg-blue-100 text-blue-800',
      'IGCSE': 'bg-purple-100 text-purple-800',
      'KPSEA': 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[system as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {system}
      </Badge>
    );
  };

  // Mock data for demonstration
  const mockUsers = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: '',
      status: 'active',
      examSystem: 'KCSE',
      level: 'Form 4',
      sparks: 2450,
      streak: 12,
      quizzesCompleted: 45,
      averageScore: 87,
      joinedAt: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: '2', 
      name: 'James Muriuki',
      email: 'james@example.com',
      avatar: '',
      status: 'active',
      examSystem: 'KCSE',
      level: 'Form 3',
      sparks: 1890,
      streak: 8,
      quizzesCompleted: 32,
      averageScore: 82,
      joinedAt: '2024-02-10',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Grace Wanjiku', 
      email: 'grace@example.com',
      avatar: '',
      status: 'inactive',
      examSystem: 'IGCSE',
      level: 'Year 11',
      sparks: 1120,
      streak: 0,
      quizzesCompleted: 18,
      averageScore: 79,
      joinedAt: '2024-03-05',
      lastActive: '2 weeks ago'
    }
  ];

  const displayUsers = filteredUsers.length > 0 ? filteredUsers : mockUsers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage student accounts and monitor platform engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button>
            Export Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">+12%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              Active learners on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842</div>
            <p className="text-xs text-muted-foreground">
              64.7% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sparks</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,456</div>
            <p className="text-xs text-muted-foreground">
              Per active user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Joined</SelectItem>
                <SelectItem value="sparks">Most Sparks</SelectItem>
                <SelectItem value="active">Most Active</SelectItem>
                <SelectItem value="performance">Best Performance</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Exam System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                <SelectItem value="kcse">KCSE</SelectItem>
                <SelectItem value="igcse">IGCSE</SelectItem>
                <SelectItem value="kpsea">KPSEA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({displayUsers.length})</CardTitle>
          <CardDescription>Detailed view of all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Exam System</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-center">Sparks</TableHead>
                  <TableHead className="text-center">Streak</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getExamSystemBadge(user.examSystem)}
                        <div className="text-sm text-muted-foreground">{user.level}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm font-medium">{user.averageScore}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.quizzesCompleted} quizzes
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{user.sparks}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.streak > 0 ? "default" : "secondary"}>
                        {user.streak} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.lastActive}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}