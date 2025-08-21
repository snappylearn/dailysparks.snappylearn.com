import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const quizTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required").regex(/^[a-z_]+$/, "Code must be lowercase letters and underscores only"),
});

type QuizTypeFormData = z.infer<typeof quizTypeSchema>;

interface QuizType {
  id: string;
  title: string;
  description?: string;
  code: string;
  createdAt: string;
}

export default function QuizTypes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuizType, setEditingQuizType] = useState<QuizType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<QuizTypeFormData>({
    resolver: zodResolver(quizTypeSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
    },
  });

  const { data: quizTypes, isLoading } = useQuery({
    queryKey: ["/api/admin/quiz-types"],
  });

  const createQuizTypeMutation = useMutation({
    mutationFn: (data: QuizTypeFormData) => 
      apiRequest("/api/admin/quiz-types", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-types"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Quiz type created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quiz type",
        variant: "destructive",
      });
    },
  });

  const updateQuizTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuizTypeFormData }) =>
      apiRequest(`/api/admin/quiz-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-types"] });
      setIsDialogOpen(false);
      setEditingQuizType(null);
      form.reset();
      toast({
        title: "Success",
        description: "Quiz type updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quiz type",
        variant: "destructive",
      });
    },
  });

  const deleteQuizTypeMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/quiz-types/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-types"] });
      toast({
        title: "Success",
        description: "Quiz type deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quiz type",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuizTypeFormData) => {
    if (editingQuizType) {
      updateQuizTypeMutation.mutate({ id: editingQuizType.id, data });
    } else {
      createQuizTypeMutation.mutate(data);
    }
  };

  const handleEdit = (quizType: QuizType) => {
    setEditingQuizType(quizType);
    form.reset({
      title: quizType.title,
      description: quizType.description || "",
      code: quizType.code,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this quiz type?")) {
      deleteQuizTypeMutation.mutate(id);
    }
  };

  const filteredQuizTypes = quizTypes?.filter((quizType: QuizType) =>
    quizType.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quizType.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Types</h1>
          <p className="text-muted-foreground">
            Manage different types of quizzes available in the system
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Quiz Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQuizType ? "Edit Quiz Type" : "Add New Quiz Type"}
              </DialogTitle>
              <DialogDescription>
                {editingQuizType 
                  ? "Update the quiz type information below."
                  : "Create a new quiz type for organizing different types of assessments."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Termly Quiz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., termly" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this quiz type and its purpose..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createQuizTypeMutation.isPending || updateQuizTypeMutation.isPending}>
                    {editingQuizType ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Types</CardTitle>
          <CardDescription>
            Different categories of quizzes that can be created and assigned to students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quiz types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading quiz types...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizTypes.map((quizType: QuizType) => (
                  <TableRow key={quizType.id}>
                    <TableCell className="font-medium">{quizType.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{quizType.code}</Badge>
                    </TableCell>
                    <TableCell>{quizType.description || "-"}</TableCell>
                    <TableCell>{new Date(quizType.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(quizType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quizType.id)}
                          disabled={deleteQuizTypeMutation.isPending}
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

          {filteredQuizTypes.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              No quiz types found. Create your first quiz type to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}