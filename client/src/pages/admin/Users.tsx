import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Mail, Calendar, Trophy, Zap, TrendingUp, Eye, Ban, Settings, User, Clock, Star, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/user-stats"],
  });

  // Fetch individual user details
  const { data: userDetails, isLoading: userDetailsLoading } = useQuery({
    queryKey: ["/api/admin/users", selectedUser?.id],
    enabled: !!selectedUser?.id,
  });

  // Block/unblock user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/status`, { isBlocked });
      if (!res.ok) {
        throw new Error("Failed to update user status");
      }
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Force refetch of all related queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      
      const action = variables.isBlocked ? "suspended" : "unsuspended";
      toast({
        title: "Success",
        description: `User ${action} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchQuery === "" || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string, isActive?: boolean) => {
    // Check if user is blocked based on isActive field
    if (isActive === false) {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    
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

  const displayUsers = filteredUsers || [];

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
            {userStats?.totalUsers > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {userStats.totalUsers > 100 ? '+12%' : 'New'}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (userStats?.totalUsers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered learners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (userStats?.activeUsers || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {userStats?.engagementRate || 0}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (userStats?.newSignups || 0)}
            </div>
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
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (userStats?.averageSparks || 0)}
            </div>
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
          ) : displayUsers.length === 0 ? (
            <div className="text-center py-8">No users found</div>
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
                    <TableCell>{getStatusBadge(user.status, user.isActive)}</TableCell>
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
                        Joined {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          data-testid={`button-view-user-${user.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled
                          data-testid={`button-email-user-${user.id}`}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const isCurrentlyBlocked = user.isActive === false;
                            blockUserMutation.mutate({ 
                              userId: user.id, 
                              isBlocked: !isCurrentlyBlocked 
                            });
                          }}
                          disabled={blockUserMutation.isPending}
                          className={user.isActive === false 
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700" 
                            : "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                          }
                          data-testid={`button-${user.isActive === false ? 'unsuspend' : 'suspend'}-user-${user.id}`}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          {user.isActive === false ? 'Unsuspend' : 'Suspend'}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          data-testid={`button-delete-user-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          {userDetailsLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading user details...</div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Basic Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userDetails.profileImageUrl} />
                  <AvatarFallback className="text-lg">
                    {(userDetails.firstName?.charAt(0) || userDetails.email?.charAt(0) || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {userDetails.firstName && userDetails.lastName 
                      ? `${userDetails.firstName} ${userDetails.lastName}`
                      : userDetails.email || 'Unknown User'
                    }
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userDetails.email || 'No email provided'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant={userDetails.isActive ? "default" : "destructive"}>
                      {userDetails.isActive ? "Active" : "Blocked"}
                    </Badge>
                    {userDetails.isPremium && (
                      <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold">{userDetails.sparks || 0}</div>
                      <div className="text-sm text-muted-foreground">Sparks</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{userDetails.currentStreak || 0}</div>
                      <div className="text-sm text-muted-foreground">Streak</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{userDetails.longestStreak || 0}</div>
                      <div className="text-sm text-muted-foreground">Best Streak</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{userDetails.rank || '-'}</div>
                      <div className="text-sm text-muted-foreground">Rank</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Academic Info */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Examination System</label>
                    <div className="mt-1">
                      {getExamSystemBadge(userDetails.examSystemName || 'Unknown')}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Level</label>
                    <div className="mt-1 font-medium">{userDetails.levelTitle || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Term</label>
                    <div className="mt-1 font-medium">{userDetails.currentTerm || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Credits</label>
                    <div className="mt-1 font-medium">${userDetails.credits || '0.00'}</div>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Activity Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Joined</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {userDetails.lastActivity ? new Date(userDetails.lastActivity).toLocaleDateString() : 'No recent activity'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Quiz</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      {userDetails.lastQuizDate ? new Date(userDetails.lastQuizDate).toLocaleDateString() : 'No quizzes taken'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Failed to load user details</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone.
              <br /><br />
              <strong>User: {userToDelete?.name || userToDelete?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
              }}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (userToDelete) {
                  deleteUserMutation.mutate(userToDelete.id);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}