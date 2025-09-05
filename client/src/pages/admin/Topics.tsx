import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Filter, Sparkles, CheckCircle, XCircle } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

const createTopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  summaryContent: z.string().optional(),
  examinationSystemId: z.string().min(1, "Examination system is required"),
  levelId: z.string().min(1, "Level is required"),
  subjectId: z.string().min(1, "Subject is required"),
  termId: z.string().optional().transform(val => val === "no-term" ? undefined : val),
});

type CreateTopicFormData = z.infer<typeof createTopicSchema>;

export default function AdminTopics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamSystem, setSelectedExamSystem] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Force re-render of editor

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<CreateTopicFormData>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      title: "",
      description: "",
      summaryContent: "",
    }
  });

  // Watch form values for dynamic filtering
  const selectedExamSystemId = form.watch("examinationSystemId");
  const selectedLevelId = form.watch("levelId");
  const selectedSubjectId = form.watch("subjectId");

  // Fetch topics data with filters
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ["/api/admin/topics"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedExamSystem !== 'all') params.append('examSystem', selectedExamSystem);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (selectedTerm !== 'all') params.append('term', selectedTerm);
      
      const response = await fetch(`/api/admin/topics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return response.json();
    },
  });

  // Fetch dropdowns data
  const { data: examSystems } = useQuery({ queryKey: ["/api/examination-systems"] });
  const { data: allLevels } = useQuery({ queryKey: ["/api/levels"] });
  const { data: allSubjects } = useQuery({ queryKey: ["/api/subjects"] });
  const { data: terms } = useQuery({ queryKey: ["/api/terms"] });

  // Filter levels based on selected examination system (for form)
  const filteredLevels = allLevels?.filter((level: any) => {
    if (!selectedExamSystemId) return true;
    return level.examinationSystemId === selectedExamSystemId || level.examination_system_id === selectedExamSystemId;
  }) || [];

  // Filter levels based on selected examination system (for main filters)
  const filteredLevelsForFilter = allLevels?.filter((level: any) => {
    if (selectedExamSystem === 'all') return true;
    return level.examinationSystemId === selectedExamSystem || level.examination_system_id === selectedExamSystem;
  }) || [];

  // Filter subjects based on selected examination system and level (for form)
  const filteredSubjects = allSubjects?.filter((subject: any) => {
    if (!selectedExamSystemId) return true;
    return subject.examinationSystemId === selectedExamSystemId || subject.examination_system_id === selectedExamSystemId;
  }) || [];

  // Filter subjects based on selected examination system (for main filters)
  const filteredSubjectsForFilter = allSubjects?.filter((subject: any) => {
    if (selectedExamSystem === 'all') return true;
    return subject.examinationSystemId === selectedExamSystem || subject.examination_system_id === selectedExamSystem;
  }) || [];

  const createTopicMutation = useMutation({
    mutationFn: async (data: CreateTopicFormData) => {
      const response = await apiRequest("POST", "/api/admin/topics", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Topic created successfully!"
      });
      setCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic",
        variant: "destructive"
      });
    }
  });

  const updateTopicMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: Partial<CreateTopicFormData> }) => {
      const response = await apiRequest("PUT", `/api/admin/topics/${data.id}`, data.updateData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Topic updated successfully!"
      });
      setEditDialogOpen(false);
      setSelectedTopic(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update topic",
        variant: "destructive"
      });
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/topics/${topicId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Topic deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete topic",
        variant: "destructive"
      });
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: async (topicId: string) => {
      const response = await apiRequest("POST", `/api/admin/topics/${topicId}/generate-content`);
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: "Content generated successfully!"
      });
      // Update the form with generated content - ensure it's a string
      let content = '';
      if (typeof data === 'string') {
        content = data;
      } else if (data && typeof data.content === 'string') {
        content = data.content;
      } else {
        toast({
          title: "Error",
          description: "Invalid content format received from server",
          variant: "destructive"
        });
        return;
      }
      editForm.setValue("summaryContent", String(content), { 
        shouldValidate: true, 
        shouldDirty: true,
        shouldTouch: true 
      });
      // Force editor re-render
      setEditorKey(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/topics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateTopicFormData) => {
    createTopicMutation.mutate(data);
  };

  const onUpdate = (data: CreateTopicFormData) => {
    if (selectedTopic) {
      updateTopicMutation.mutate({
        id: selectedTopic.id,
        updateData: data
      });
    }
  };

  const editForm = useForm<CreateTopicFormData>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      title: "",
      description: "",
      summaryContent: "",
    }
  });

  // Update edit form when selectedTopic changes
  useEffect(() => {
    if (selectedTopic) {
      editForm.reset({
        title: selectedTopic.title || "",
        description: selectedTopic.description || "",
        summaryContent: selectedTopic.summaryContent || selectedTopic.content || "",
        examinationSystemId: selectedTopic.examinationSystemId || selectedTopic.examination_system_id || "",
        levelId: selectedTopic.levelId || selectedTopic.level_id || "",
        subjectId: selectedTopic.subjectId || selectedTopic.subject_id || "",
        termId: selectedTopic.termId || selectedTopic.term_id || "",
      });
    }
  }, [selectedTopic, editForm]);

  const filteredTopics = topics?.filter((topic: any) => {
    const matchesSearch = searchQuery === "" || 
      topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Topic Management</h2>
          <p className="text-muted-foreground">
            Create and manage topics for different examination systems, levels, and subjects
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="examinationSystemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Examination System *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          // Reset level and subject when exam system changes
                          form.setValue("levelId", "");
                          form.setValue("subjectId", "");
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select examination system" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {examSystems?.map((system: any) => (
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
                    control={form.control}
                    name="levelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          // Reset subject when level changes
                          form.setValue("subjectId", "");
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredLevels?.map((level: any) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSubjects?.map((subject: any) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-term">No Term</SelectItem>
                            {terms?.map((term: any) => (
                              <SelectItem key={term.id} value={term.id}>
                                {term.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter topic title" {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter topic description" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summaryContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Notes (Optional)</FormLabel>
                      <FormControl>
                        <div data-color-mode="light">
                          <MDEditor
                            value={field.value || ""}
                            onChange={(value) => field.onChange(value || "")}
                            preview="edit"
                            hideToolbar={false}
                            visibleDragBar={false}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTopicMutation.isPending}>
                    {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter topics by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select value={selectedExamSystem} onValueChange={(value) => {
              setSelectedExamSystem(value);
              // Reset level and subject when exam system changes
              setSelectedLevel("all");
              setSelectedSubject("all");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Exam System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Systems</SelectItem>
                {examSystems?.map((system: any) => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={(value) => {
              setSelectedLevel(value);
              // Reset subject when level changes
              setSelectedSubject("all");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {filteredLevelsForFilter?.map((level: any) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {filteredSubjectsForFilter?.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {terms?.map((term: any) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Topics ({filteredTopics.length})</CardTitle>
          <CardDescription>All topics organized by examination system, level, and subject</CardDescription>
        </CardHeader>
        <CardContent>
          {topicsLoading ? (
            <div className="text-center py-8">Loading topics...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Has Notes</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic: any) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {topic.examination_system || topic.examinationSystem || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {topic.level || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {topic.subject || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {topic.term ? (
                        <Badge variant="outline" className="text-xs">
                          {topic.term}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">No term</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {topic.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {topic.summaryContent || topic.content ? (
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 text-xs">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-xs">No</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{topic.quizCount || 0}</TableCell>
                    <TableCell className="text-center">{topic.quizAttempts || 0}</TableCell>
                    <TableCell className="text-center">{topic.usersCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTopic(topic);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this topic?')) {
                              deleteTopicMutation.mutate(topic.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredTopics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No topics found. Create your first topic!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Topic Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="examinationSystemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Examination System *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        editForm.setValue("levelId", "");
                        editForm.setValue("subjectId", "");
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select examination system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examSystems?.map((system: any) => (
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
                  name="levelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        editForm.setValue("subjectId", "");
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredLevels?.map((level: any) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.title}
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
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubjects?.map((subject: any) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
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
                  name="termId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-term">No Term</SelectItem>
                          {terms?.map((term: any) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter topic title" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter topic description" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="summaryContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Content Notes</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectedTopic && generateContentMutation.mutate(selectedTopic.id)}
                        disabled={generateContentMutation.isPending}
                        className="ml-2"
                        data-testid="generate-content-button"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {generateContentMutation.isPending ? "Generating..." : "Generate Content"}
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          key={`editor-${selectedTopic?.id || 'new'}-${editorKey}`}
                          value={field.value || ""}
                          onChange={(value) => field.onChange(value || "")}
                          preview="edit"
                          hideToolbar={false}
                          visibleDragBar={false}
                          height={300}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedTopic(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTopicMutation.isPending}>
                  {updateTopicMutation.isPending ? "Updating..." : "Update Topic"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}