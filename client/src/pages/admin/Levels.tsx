import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

const levelSchema = z.object({
  examinationSystemId: z.string().min(1, "Examination system is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type LevelFormData = z.infer<typeof levelSchema>;

export default function AdminLevels() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamSystem, setSelectedExamSystem] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addForm = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      examinationSystemId: "",
      title: "",
      description: "",
    }
  });

  const editForm = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
  });

  // Fetch data
  const { data: levels, isLoading } = useQuery({
    queryKey: ["/api/levels"],
  });

  const { data: examinationSystems } = useQuery({
    queryKey: ["/api/examination-systems"],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: LevelFormData) => {
      return apiRequest("POST", "/api/admin/levels", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Level added successfully!"
      });
      setAddDialogOpen(false);
      addForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add level",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: LevelFormData) => {
      return apiRequest("PUT", `/api/admin/levels/${selectedLevel.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Level updated successfully!"
      });
      setEditDialogOpen(false);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update level",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/levels/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Level deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete level",
        variant: "destructive"
      });
    }
  });

  const onAddSubmit = (data: LevelFormData) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: LevelFormData) => {
    updateMutation.mutate(data);
  };

  const handleEdit = (level: any) => {
    setSelectedLevel(level);
    editForm.reset({
      examinationSystemId: level.examinationSystemId,
      title: level.title,
      description: level.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this level?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredLevels = levels?.filter((level: any) => {
    const matchesSearch = level.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExamSystem = selectedExamSystem === "all" || level.examinationSystemId === selectedExamSystem;
    return matchesSearch && matchesExamSystem;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Levels</h2>
          <p className="text-muted-foreground">
            Manage academic levels (Form 1, Form 2, Grade 1, etc.)
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Level
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Level</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="examinationSystemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Examination System *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select examination system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examinationSystems?.map((system: any) => (
                            <SelectItem key={system.id} value={system.id}>
                              {system.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter level title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Adding..." : "Add Level"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search levels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedExamSystem} onValueChange={setSelectedExamSystem}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by exam system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                {examinationSystems?.map((system: any) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Levels ({filteredLevels.length})</CardTitle>
          <CardDescription>
            List of all academic levels in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Examination System</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLevels.map((level: any) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {examinationSystems?.find((s: any) => s.id === level.examinationSystemId)?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{level.description || "-"}</TableCell>
                    <TableCell className="text-center">{level.quizCount || 0}</TableCell>
                    <TableCell className="text-center">{level.quizAttempts || 0}</TableCell>
                    <TableCell className="text-center">{level.usersCount || 0}</TableCell>
                    <TableCell>{new Date(level.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(level)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(level.id)}
                          className="text-red-600 hover:text-red-700"
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Level</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="examinationSystemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Examination System *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select examination system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {examinationSystems?.map((system: any) => (
                          <SelectItem key={system.id} value={system.id}>
                            {system.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter level title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Level"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}