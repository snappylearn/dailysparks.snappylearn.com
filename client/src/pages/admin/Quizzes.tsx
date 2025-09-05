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
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Eye, Users, BarChart3, Filter, FileText, Trash2 } from "lucide-react";

const generateQuizSchema = z.object({
  examinationSystemId: z.string().min(1, "Examination system is required"),
  levelId: z.string().min(1, "Level is required"),
  subjectId: z.string().min(1, "Subject is required"),
  quizType: z.string().min(1, "Quiz type is required"),
  topicId: z.string().optional(),
  termId: z.string().optional(),
  questionCount: z.number().min(5).max(50).default(15),
  timeLimit: z.number().min(5).max(120).default(30)
});

const addQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  examinationSystemId: z.string().min(1, "Examination system is required"),
  levelId: z.string().min(1, "Level is required"),
  subjectId: z.string().min(1, "Subject is required"),
  quizType: z.string().min(1, "Quiz type is required"),
  topicId: z.string().optional(),
  termId: z.string().optional(),
  timeLimit: z.number().min(5).max(120).default(30),
  difficulty: z.string().default("medium"),
  questions: z.array(z.object({
    questionText: z.string().min(1, "Question text is required"),
    optionA: z.string().min(1, "Option A is required"),
    optionB: z.string().min(1, "Option B is required"),
    optionC: z.string().min(1, "Option C is required"),
    optionD: z.string().min(1, "Option D is required"),
    correctAnswer: z.enum(["A", "B", "C", "D"]),
    explanation: z.string().optional()
  })).min(1, "At least one question is required")
});

type GenerateQuizFormData = z.infer<typeof generateQuizSchema>;
type AddQuizFormData = z.infer<typeof addQuizSchema>;

export default function AdminQuizzes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamSystem, setSelectedExamSystem] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Initialize forms
  const form = useForm<GenerateQuizFormData>({
    resolver: zodResolver(generateQuizSchema),
    defaultValues: {
      questionCount: 15,
      timeLimit: 30
    }
  });

  const addForm = useForm<AddQuizFormData>({
    resolver: zodResolver(addQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      difficulty: "medium",
      questions: [
        {
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A" as const,
          explanation: ""
        }
      ]
    }
  });

  // Watch form values for dynamic filtering
  const selectedExamSystemId = form.watch("examinationSystemId");
  const selectedLevelId = form.watch("levelId");
  const selectedSubjectId = form.watch("subjectId");

  // Watch add form values
  const addSelectedExamSystemId = addForm.watch("examinationSystemId");
  const addSelectedLevelId = addForm.watch("levelId");
  const addSelectedSubjectId = addForm.watch("subjectId");

  // Fetch quiz data with filters
  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/admin/quizzes"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedExamSystem !== 'all') params.append('examSystem', selectedExamSystem);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (selectedTopic !== 'all') params.append('topic', selectedTopic);
      if (selectedTerm !== 'all') params.append('term', selectedTerm);
      
      const response = await fetch(`/api/admin/quizzes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      return response.json();
    },
  });

  // Fetch dropdowns data
  const { data: examSystems } = useQuery({ queryKey: ["/api/examination-systems"] });
  const { data: allLevels } = useQuery({ queryKey: ["/api/levels"] });
  const { data: allSubjects } = useQuery({ queryKey: ["/api/subjects"] });
  const { data: topics } = useQuery({ 
    queryKey: [`/api/topics/${selectedSubjectId}/${selectedLevelId}`],
    enabled: !!selectedSubjectId && !!selectedLevelId
  });
  const { data: terms } = useQuery({ queryKey: ["/api/terms"] });

  // Filter levels based on selected examination system (for form)
  const filteredLevels = allLevels?.filter((level: any) => {
    if (!selectedExamSystemId) return true; // Show all if none selected
    // Check both camelCase and snake_case field names
    return level.examinationSystemId === selectedExamSystemId || level.examination_system_id === selectedExamSystemId;
  }) || [];

  // Filter levels based on selected examination system (for main filters)
  const filteredLevelsForFilter = allLevels?.filter((level: any) => {
    if (selectedExamSystem === 'all') return true; // Show all if none selected
    // Check both camelCase and snake_case field names
    return level.examinationSystemId === selectedExamSystem || level.examination_system_id === selectedExamSystem;
  }) || [];

  // Filter subjects based on selected examination system
  const filteredSubjects = allSubjects?.filter((subject: any) => {
    if (!selectedExamSystemId) return true; // Show all if none selected
    // Check both camelCase and snake_case field names
    return subject.examinationSystemId === selectedExamSystemId || subject.examination_system_id === selectedExamSystemId;
  }) || [];

  // Filter data for Add Quiz form
  const addFilteredLevels = allLevels?.filter((level: any) => {
    if (!addSelectedExamSystemId) return true;
    return level.examinationSystemId === addSelectedExamSystemId || level.examination_system_id === addSelectedExamSystemId;
  }) || [];

  const addFilteredSubjects = allSubjects?.filter((subject: any) => {
    if (!addSelectedExamSystemId) return true;
    return subject.examinationSystemId === addSelectedExamSystemId || subject.examination_system_id === addSelectedExamSystemId;
  }) || [];

  // Debug logging - Remove after testing
  // console.log('selectedExamSystemId:', selectedExamSystemId);
  // console.log('allLevels:', allLevels);
  // console.log('filteredLevels:', filteredLevels);
  // console.log('allSubjects:', allSubjects);
  // console.log('filteredSubjects:', filteredSubjects);
  // console.log('examSystems:', examSystems);

  const generateQuizMutation = useMutation({
    mutationFn: async (data: GenerateQuizFormData) => {
      return apiRequest("POST", "/api/admin/generate-quiz", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz generated successfully!"
      });
      setGenerateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive"
      });
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      return apiRequest("DELETE", `/api/admin/quizzes/${quizId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Quiz deleted successfully!"
      });
      // Force refetch the quiz list to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/quizzes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quiz",
        variant: "destructive"
      });
    }
  });

  const addQuizMutation = useMutation({
    mutationFn: async (data: AddQuizFormData) => {
      return apiRequest("POST", "/api/admin/quizzes", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz added successfully!"
      });
      setAddDialogOpen(false);
      addForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add quiz",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: GenerateQuizFormData) => {
    generateQuizMutation.mutate(data);
  };

  const onAddSubmit = (data: AddQuizFormData) => {
    addQuizMutation.mutate(data);
  };

  const filteredQuizzes = quizzes?.filter((quiz: any) => {
    const matchesSearch = searchQuery === "" || 
      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const selectedQuizType = form.watch("quizType");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quiz Management</h2>
          <p className="text-muted-foreground">
            Generate, edit, and manage all quizzes
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Generate Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate New Quiz</DialogTitle>
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
                          // Reset dependent fields when exam system changes
                          form.setValue("levelId", "");
                          form.setValue("subjectId", "");
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam system" />
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
                          // Reset subject and topic when level changes
                          form.setValue("subjectId", "");
                          form.setValue("topicId", "");
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
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          // Reset topic when subject changes
                          form.setValue("topicId", "");
                        }} defaultValue={field.value}>
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
                    name="quizType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quiz type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="random">Random</SelectItem>
                            <SelectItem value="topical">Topical</SelectItem>
                            <SelectItem value="term">Termly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedQuizType === "topical" && (
                    <FormField
                      control={form.control}
                      name="topicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {topics?.map((topic: any) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                  {topic.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedQuizType === "term" && (
                    <FormField
                      control={form.control}
                      name="termId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                  )}

                  <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="5" 
                            max="50" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="5" 
                            max="120" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setGenerateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={generateQuizMutation.isPending}>
                    {generateQuizMutation.isPending ? "Generating..." : "Generate Quiz"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Quiz</DialogTitle>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-6">
                  {/* Basic Quiz Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter quiz title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter quiz description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* System Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="examinationSystemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Examination System *</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            addForm.setValue("levelId", "");
                            addForm.setValue("subjectId", "");
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select exam system" />
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
                      control={addForm.control}
                      name="levelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level *</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            addForm.setValue("subjectId", "");
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {addFilteredLevels?.map((level: any) => (
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
                      control={addForm.control}
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
                              {addFilteredSubjects?.map((subject: any) => (
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
                      control={addForm.control}
                      name="quizType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quiz Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select quiz type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="random">Random</SelectItem>
                              <SelectItem value="topical">Topical</SelectItem>
                              <SelectItem value="term">Term-based</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Conditional Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {addForm.watch("quizType") === "topical" && (
                      <FormField
                        control={addForm.control}
                        name="topicId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topic</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select topic" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {editFilteredTopics?.map((topic: any) => (
                                  <SelectItem key={topic.id} value={topic.id}>
                                    {topic.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {addForm.watch("quizType") === "term" && (
                      <FormField
                        control={addForm.control}
                        name="termId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Term</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                    )}

                    <FormField
                      control={addForm.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="5"
                              max="120"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Questions Section */}
                  <AddQuizQuestions form={addForm} />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addQuizMutation.isPending}>
                      {addQuizMutation.isPending ? "Adding..." : "Add Quiz"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter quizzes by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select value={selectedExamSystem} onValueChange={(value) => {
              setSelectedExamSystem(value);
              // Reset level when exam system changes
              setSelectedLevel("all");
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

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
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
                {allSubjects?.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics?.map((topic: any) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title}
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

      {/* Quiz Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quizzes ({filteredQuizzes.length})</CardTitle>
          <CardDescription>All generated quizzes with analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {quizzesLoading ? (
            <div className="text-center py-8">Loading quizzes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-center">Sessions</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz: any) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {quiz.examination_system || quiz.examinationSystem || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {quiz.level || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {quiz.type || 'topical'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {Array.isArray(quiz.questions) ? quiz.questions.length : quiz.questions || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        {quiz.sessions || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-green-500" />
                        {quiz.users || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {quiz.created ? new Date(quiz.created).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setEditDialogOpen(true);
                          }}
                          title="Edit quiz"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLocation(`/quiz-preview/${quiz.id}`)}
                          title="Preview quiz as student would see it"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the quiz "${quiz.title}"? This action cannot be undone.`)) {
                              deleteQuizMutation.mutate(quiz.id);
                            }
                          }}
                          title="Delete quiz"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredQuizzes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No quizzes found. Generate your first quiz!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Questions Dialog */}
      <Dialog open={questionsDialogOpen} onOpenChange={setQuestionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Questions</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedQuiz?.title || 'Untitled Quiz'} • {selectedQuiz?.questions?.length || 0} questions
            </p>
          </DialogHeader>
          {selectedQuiz && <QuizQuestionsView quiz={selectedQuiz} />}
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
          </DialogHeader>
          {selectedQuiz && <EditQuizForm quiz={selectedQuiz} onClose={() => setEditDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quiz Questions View Component
function QuizQuestionsView({ quiz }: { quiz: any }) {
  const questions = quiz.questions || [];
  
  if (!questions.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No questions found in this quiz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question: any, index: number) => (
        <Card key={question.id || index} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base font-medium">
                  Question {index + 1}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {question.marks || 1} {(question.marks || 1) === 1 ? 'mark' : 'marks'} • {question.difficulty || 'Medium'}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {question.questionType || 'MCQ'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm leading-relaxed">
              {question.content || question.questionText || 'No question text'}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Options:</p>
              <div className="grid gap-2">
                {question.choices?.map((choice: any, choiceIndex: number) => (
                  <div 
                    key={choice.id || choiceIndex}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      choice.isCorrect 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                      choice.isCorrect 
                        ? 'border-green-500 bg-green-100 text-green-700' 
                        : 'border-gray-300 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + choiceIndex)}
                    </div>
                    <span className="flex-1 text-sm">{choice.content || choice.text || 'No option text'}</span>
                    {choice.isCorrect && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Correct
                      </Badge>
                    )}
                  </div>
                )) || (
                  // Fallback for old format with optionA, optionB, etc.
                  ['optionA', 'optionB', 'optionC', 'optionD'].map((optionKey, choiceIndex) => {
                    const optionText = question[optionKey];
                    const isCorrect = question.correctAnswer === String.fromCharCode(65 + choiceIndex);
                    
                    if (!optionText) return null;
                    
                    return (
                      <div 
                        key={optionKey}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCorrect 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                          isCorrect 
                            ? 'border-green-500 bg-green-100 text-green-700' 
                            : 'border-gray-300 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + choiceIndex)}
                        </div>
                        <span className="flex-1 text-sm">{optionText}</span>
                        {isCorrect && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Correct
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {question.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Explanation</p>
                <p className="text-sm text-blue-700 leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Edit Quiz Form Component
function EditQuizForm({ quiz, onClose }: { quiz: any; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editChoicesOpen, setEditChoicesOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1);

  // Fetch complete quiz data with questions
  const { data: fullQuizData, isLoading: quizLoading } = useQuery({
    queryKey: [`/api/admin/quizzes/${quiz.id}`],
  });

  // Fetch required data for form dropdowns
  const { data: examSystems } = useQuery({
    queryKey: ["/api/examination-systems"],
  });

  const { data: allLevels } = useQuery({
    queryKey: ["/api/levels"],
  });

  const { data: allSubjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: terms } = useQuery({
    queryKey: ["/api/terms"],
  });

  const { data: topics } = useQuery({
    queryKey: ["/api/admin/topics"],
  });

  // Default questions
  const defaultQuestions = [
    {
      id: "q_1",
      content: "What is the basic unit of life in all living organisms?",
      type: "mcq",
      choices: [
        { id: "c_1", content: "Cell", isCorrect: true },
        { id: "c_2", content: "Tissue", isCorrect: false },
        { id: "c_3", content: "Organ", isCorrect: false },
        { id: "c_4", content: "Organ system", isCorrect: false }
      ],
      explanation: "The cell is considered the basic unit of life because it is the smallest structure capable of performing all the processes necessary for life."
    }
  ];
  
  // Initialize questions state
  const [questions, setQuestions] = useState(defaultQuestions);

  // Update questions when data loads
  useEffect(() => {
    if (fullQuizData?.questions && Array.isArray(fullQuizData.questions)) {
      setQuestions(fullQuizData.questions);
    }
  }, [fullQuizData]);

  const editQuizSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    examinationSystemId: z.string().min(1, "Examination system is required"),
    levelId: z.string().min(1, "Level is required"),
    subjectId: z.string().min(1, "Subject is required"),
    quizType: z.string().min(1, "Quiz type is required"),
    topicId: z.string().optional(),
    termId: z.string().optional(),
    timeLimit: z.number().min(5).max(120),
    totalQuestions: z.number().min(1).max(50)
  });

  const form = useForm({
    resolver: zodResolver(editQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      examinationSystemId: "",
      levelId: "",
      subjectId: "",
      quizType: "",
      topicId: "",
      termId: "",
      timeLimit: 30,
      totalQuestions: 15
    }
  });

  // Update form values when quiz data loads
  useEffect(() => {
    if (fullQuizData) {
      console.log("Quiz data loaded:", fullQuizData);
      form.reset({
        title: fullQuizData.title || "",
        description: fullQuizData.description || "",
        examinationSystemId: fullQuizData.examinationSystemId || "",
        levelId: fullQuizData.levelId || "",
        subjectId: fullQuizData.subjectId || "",
        quizType: fullQuizData.quizType || "",
        topicId: fullQuizData.topicId || "",
        termId: fullQuizData.termId || "",
        timeLimit: fullQuizData.timeLimit || 30,
        totalQuestions: fullQuizData.totalQuestions || questions.length
      });
    }
  }, [fullQuizData, form, questions.length]);

  // Filter terms by selected examination system
  const currentExamSystemId = form.watch("examinationSystemId");
  const filteredTerms = terms?.filter((term: any) => 
    term.examinationSystemId === currentExamSystemId
  ) || [];
  
  console.log("Current exam system:", currentExamSystemId);
  console.log("All terms:", terms);
  console.log("Filtered terms:", filteredTerms);
  console.log("Current termId:", form.watch("termId"));

  // Filter topics by selected examination system, level, and subject for Edit Quiz form
  const editFilteredTopics = topics?.filter((topic: any) => {
    const currentExamSystemId = form.watch("examinationSystemId");
    const currentLevelId = form.watch("levelId"); 
    const currentSubjectId = form.watch("subjectId");
    
    // Only show topics that match all three criteria
    return topic.examinationSystemId === currentExamSystemId &&
           topic.levelId === currentLevelId &&
           topic.subjectId === currentSubjectId;
  }) || [];

  const updateQuizMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/admin/quizzes/${quiz.id}`, { ...data, questions });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quiz",
        variant: "destructive"
      });
    }
  });

  // Show loading state
  if (quizLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading quiz details...</p>
        </div>
      </div>
    );
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      content: "",
      type: "mcq",
      choices: [
        { id: `c_${Date.now()}_1`, content: "", isCorrect: false },
        { id: `c_${Date.now()}_2`, content: "", isCorrect: false },
        { id: `c_${Date.now()}_3`, content: "", isCorrect: false },
        { id: `c_${Date.now()}_4`, content: "", isCorrect: false }
      ],
      explanation: ""
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    
    // Update the form totalQuestions to match the new count
    form.setValue('totalQuestions', updatedQuestions.length);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[choiceIndex] = {
      ...updatedQuestions[questionIndex].choices[choiceIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.forEach((choice: any, idx: number) => {
      choice.isCorrect = idx === choiceIndex;
    });
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_: any, i: number) => i !== index);
    setQuestions(updatedQuestions);
    
    // Update the form totalQuestions to match the new count
    form.setValue('totalQuestions', updatedQuestions.length);
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateQuizMutation.mutate(data))} className="space-y-6">
        {/* Basic Quiz Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter quiz title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="timeLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Limit (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter quiz description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* System Configuration Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="examinationSystemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Examination System *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam system" />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allLevels?.map((level: any) => (
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allSubjects?.map((subject: any) => (
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
            name="quizType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quiz type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                    <SelectItem value="term">Term-based</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional Fields */}
        <div className="grid grid-cols-2 gap-4">
          {form.watch("quizType") === "topical" && (
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTopics?.map((topic: any) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {form.watch("quizType") === "term" && (
            <FormField
              control={form.control}
              name="termId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTerms?.length === 0 ? (
                        <SelectItem value="" disabled>No terms available for this system</SelectItem>
                      ) : (
                        filteredTerms?.map((term: any) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
            <Button type="button" onClick={addQuestion} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.map((question: any, questionIndex: number) => (
            <Card key={question.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {questionIndex + 1}</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    Remove
                  </Button>
                </div>

                <Input
                  value={question.content}
                  onChange={(e) => updateQuestion(questionIndex, 'content', e.target.value)}
                  placeholder="Enter question content"
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Answer Choices</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingQuestionIndex(questionIndex);
                        setEditChoicesOpen(true);
                      }}
                    >
                      Edit Choices
                    </Button>
                  </div>
                  
                  {/* Show simplified choices preview */}
                  <div className="space-y-1">
                    {question.choices?.slice(0, 4).map((choice: any, choiceIndex: number) => (
                      <div key={choice.id} className="flex items-center gap-2 text-sm">
                        <span className="w-6 font-medium">
                          {String.fromCharCode(65 + choiceIndex)}
                        </span>
                        <span className={`flex-1 ${choice.isCorrect ? 'font-semibold text-green-600' : 'text-gray-600'}`}>
                          {choice.content || `Choice ${String.fromCharCode(65 + choiceIndex)}`}
                        </span>
                        {choice.isCorrect && <span className="text-green-600 text-xs">✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                    placeholder="Enter explanation for the correct answer"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateQuizMutation.isPending}>
            {updateQuizMutation.isPending ? "Updating..." : "Update Quiz"}
          </Button>
        </div>
      </form>
    </Form>

    {/* Edit Choices Dialog */}
    <Dialog open={editChoicesOpen} onOpenChange={setEditChoicesOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Answer Choices</DialogTitle>
        </DialogHeader>
        {editingQuestionIndex >= 0 && questions[editingQuestionIndex] && (
          <EditChoicesForm
            question={questions[editingQuestionIndex]}
            onSave={(updatedChoices) => {
              const updatedQuestions = [...questions];
              updatedQuestions[editingQuestionIndex].choices = updatedChoices;
              setQuestions(updatedQuestions);
              setEditChoicesOpen(false);
            }}
            onCancel={() => setEditChoicesOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

// Edit Choices Form Component
function EditChoicesForm({ 
  question, 
  onSave, 
  onCancel 
}: { 
  question: any; 
  onSave: (choices: any[]) => void; 
  onCancel: () => void; 
}) {
  const [choices, setChoices] = useState(question.choices || [
    { id: `c_${Date.now()}_1`, content: "", isCorrect: false },
    { id: `c_${Date.now()}_2`, content: "", isCorrect: false },
    { id: `c_${Date.now()}_3`, content: "", isCorrect: false },
    { id: `c_${Date.now()}_4`, content: "", isCorrect: false }
  ]);

  const updateChoice = (choiceIndex: number, field: string, value: any) => {
    const updatedChoices = [...choices];
    updatedChoices[choiceIndex] = { ...updatedChoices[choiceIndex], [field]: value };
    setChoices(updatedChoices);
  };

  const setCorrectAnswer = (choiceIndex: number) => {
    const updatedChoices = [...choices];
    updatedChoices.forEach((choice: any, idx: number) => {
      choice.isCorrect = idx === choiceIndex;
    });
    setChoices(updatedChoices);
  };

  const addChoice = () => {
    const newChoice = {
      id: `c_${Date.now()}_${choices.length + 1}`,
      content: "",
      isCorrect: false
    };
    setChoices([...choices, newChoice]);
  };

  const removeChoice = (choiceIndex: number) => {
    if (choices.length <= 2) return; // Minimum 2 choices required
    const updatedChoices = choices.filter((_, idx) => idx !== choiceIndex);
    setChoices(updatedChoices);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Question:</label>
        <p className="text-sm text-gray-600 mt-1">{question.content}</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Answer Choices (Select the correct answer):</label>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={addChoice}>
              <Plus className="h-4 w-4 mr-1" />
              Add Choice
            </Button>
          </div>
        </div>
        {choices.map((choice: any, choiceIndex: number) => (
          <div key={choice.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="radio"
              name="correct_answer"
              checked={choice.isCorrect}
              onChange={() => setCorrectAnswer(choiceIndex)}
              className="w-4 h-4"
            />
            <span className="w-8 text-sm font-semibold">
              {String.fromCharCode(65 + choiceIndex)}
            </span>
            <Input
              value={choice.content}
              onChange={(e) => updateChoice(choiceIndex, 'content', e.target.value)}
              placeholder={`Enter choice ${String.fromCharCode(65 + choiceIndex)}`}
              className="flex-1"
            />
            {choices.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeChoice(choiceIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={() => onSave(choices)}>
          Save Choices
        </Button>
      </div>
    </div>
  );
}

// Add Quiz Questions Component
function AddQuizQuestions({ form }: { form: any }) {
  const { control, setValue, watch } = form;
  const questions = watch("questions") || [];

  const addQuestion = () => {
    const newQuestion = {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A" as const,
      explanation: ""
    };
    setValue("questions", [...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_: any, i: number) => i !== index);
    setValue("questions", updatedQuestions);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setValue("questions", updatedQuestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions</h3>
        <Button type="button" onClick={addQuestion} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {questions.map((question: any, index: number) => (
        <Card key={index} className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Question {index + 1}</h4>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Question Text *</label>
                <Textarea
                  value={question.questionText}
                  onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                  placeholder="Enter the question text"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Option A *</label>
                  <Input
                    value={question.optionA}
                    onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                    placeholder="Enter option A"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Option B *</label>
                  <Input
                    value={question.optionB}
                    onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                    placeholder="Enter option B"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Option C *</label>
                  <Input
                    value={question.optionC}
                    onChange={(e) => updateQuestion(index, "optionC", e.target.value)}
                    placeholder="Enter option C"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Option D *</label>
                  <Input
                    value={question.optionD}
                    onChange={(e) => updateQuestion(index, "optionD", e.target.value)}
                    placeholder="Enter option D"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Correct Answer *</label>
                <Select
                  value={question.correctAnswer}
                  onValueChange={(value) => updateQuestion(index, "correctAnswer", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Explanation (Optional)</label>
                <Textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(index, "explanation", e.target.value)}
                  placeholder="Enter explanation for the correct answer"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </Card>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No questions added yet. Click "Add Question" to get started.</p>
        </div>
      )}
    </div>
  );
}