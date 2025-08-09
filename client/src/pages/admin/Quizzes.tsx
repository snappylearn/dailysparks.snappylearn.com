import { useState } from "react";
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
import { Plus, Search, Edit, Eye, Users, BarChart3, Filter } from "lucide-react";

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

type GenerateQuizFormData = z.infer<typeof generateQuizSchema>;

export default function AdminQuizzes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamSystem, setSelectedExamSystem] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form first
  const form = useForm<GenerateQuizFormData>({
    resolver: zodResolver(generateQuizSchema),
    defaultValues: {
      questionCount: 15,
      timeLimit: 30
    }
  });

  // Watch form values for dynamic filtering
  const selectedExamSystemId = form.watch("examinationSystemId");
  const selectedLevelId = form.watch("levelId");
  const selectedSubjectId = form.watch("subjectId");

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

  // Filter levels based on selected examination system
  const filteredLevels = allLevels?.filter((level: any) => {
    if (!selectedExamSystemId) return true; // Show all if none selected
    // Check both camelCase and snake_case field names
    return level.examinationSystemId === selectedExamSystemId || level.examination_system_id === selectedExamSystemId;
  }) || [];

  // Filter subjects based on selected examination system
  const filteredSubjects = allSubjects?.filter((subject: any) => {
    if (!selectedExamSystemId) return true; // Show all if none selected
    // Check both camelCase and snake_case field names
    return subject.examinationSystemId === selectedExamSystemId || subject.examination_system_id === selectedExamSystemId;
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

  const onSubmit = (data: GenerateQuizFormData) => {
    generateQuizMutation.mutate(data);
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
            <Select value={selectedExamSystem} onValueChange={setSelectedExamSystem}>
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
                {allLevels?.map((level: any) => (
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
                      <Badge variant="outline" className="capitalize">
                        {quiz.quizType}
                      </Badge>
                    </TableCell>
                    <TableCell>{quiz.questionCount}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        {quiz.sessionsCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-green-500" />
                        {quiz.usersCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(quiz.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredQuizzes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No quizzes found. Generate your first quiz!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}