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

const subjectSchema = z.object({
  examinationSystemId: z.string().min(1, "Examination system is required"),
  name: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function AdminSubjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamSystem, setSelectedExamSystem] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      examinationSystemId: "",
      name: "",
      description: "",
    }
  });

  const editForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  // Fetch data
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: examinationSystems } = useQuery({
    queryKey: ["/api/examination-systems"],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: SubjectFormData) => {
      return apiRequest("POST", "/api/admin/subjects", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subject added successfully!"
      });
      setAddDialogOpen(false);
      addForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SubjectFormData) => {
      return apiRequest("PUT", `/api/admin/subjects/${selectedSubject.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subject updated successfully!"
      });
      setEditDialogOpen(false);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/subjects/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subject deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive"
      });
    }
  });

  const onAddSubmit = (data: SubjectFormData) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: SubjectFormData) => {
    updateMutation.mutate(data);
  };

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject);
    editForm.reset({
      examinationSystemId: subject.examinationSystemId,
      name: subject.name,
      description: subject.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredSubjects = subjects?.filter((subject: any) => {
    const matchesSearch = subject.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExamSystem = selectedExamSystem === "all" || subject.examinationSystemId === selectedExamSystem;
    return matchesSearch && matchesExamSystem;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
          <p className="text-muted-foreground">
            Manage academic subjects (Mathematics, English, Physics, etc.)
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subject</DialogTitle>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subject title" {...field} />
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
                    {addMutation.isPending ? "Adding..." : "Add Subject"}
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
          <CardTitle>Search Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
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

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects ({filteredSubjects.length})</CardTitle>
          <CardDescription>
            List of all academic subjects in the platform
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
                  <TableHead>Topics</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject: any) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {examinationSystems?.find((s: any) => s.id === subject.examinationSystemId)?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{subject.description || "-"}</TableCell>
                    <TableCell className="text-center">{subject.topicsCount || 0}</TableCell>
                    <TableCell className="text-center">{subject.quizCount || 0}</TableCell>
                    <TableCell className="text-center">{subject.quizAttempts || 0}</TableCell>
                    <TableCell className="text-center">{subject.usersCount || 0}</TableCell>
                    <TableCell>{new Date(subject.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subject)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subject.id)}
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
            <DialogTitle>Edit Subject</DialogTitle>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject title" {...field} />
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
                  {updateMutation.isPending ? "Updating..." : "Update Subject"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}