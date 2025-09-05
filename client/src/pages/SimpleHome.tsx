import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Profile, Subject, Topic } from "@shared/schema";
import { Book, Flame, Zap, TrendingUp, Plus, FileText, BookOpen, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";

export default function Home() {
  const { user } = useAuth();
  const [selectedSubjectForNotes, setSelectedSubjectForNotes] = useState<Subject | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Get user profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const currentProfile = profiles[0]; // Use first profile for now

  // Get all subjects and filter by current profile's examination system
  const { data: allSubjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
    enabled: !!currentProfile?.examinationSystemId,
  });

  // Filter subjects by examination system
  const subjects = allSubjects.filter(subject => 
    subject.examinationSystemId === currentProfile?.examinationSystemId
  );

  // Get user stats for progress section
  const { data: userStats } = useQuery<{
    totalSparks: number;
    totalQuizzes: number;
    averageScore: number;
    currentStreak: number;
  }>({
    queryKey: ['/api/user-stats'],
    enabled: !!user,
  });

  // Get topics for study notes when a subject is selected
  const { data: topics = [], isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['/api/topics', selectedSubjectForNotes?.id, currentProfile?.levelId],
    enabled: !!selectedSubjectForNotes && !!currentProfile?.levelId && showTopicModal,
  });

  // Handle study notes topic selection
  const handleStudyNotesClick = (subject: Subject) => {
    setSelectedSubjectForNotes(subject);
    setShowTopicModal(true);
  };

  // Navigate to study notes page
  const handleTopicSelect = (topic: Topic) => {
    setShowTopicModal(false);
    window.location.href = `/study-notes/${topic.id}?subject=${selectedSubjectForNotes?.name}`;
  };

  if (profilesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <p className="text-gray-600">Loading your profiles...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Learning Profiles Found</CardTitle>
            <CardDescription>
              You need to create a learning profile to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* All Subjects */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-orange-500 mr-2" />
            Choose Your Subject
          </h2>
          <p className="text-gray-600 mb-6">Select a subject to start your quiz</p>
          
          {subjects.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {subjects.map((subject) => (
                  <Card 
                    key={subject.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-2 hover:border-orange-300 bg-white"
                    onClick={() => {
                      console.log('Clicking subject card:', subject.name, subject.id);
                      window.location.href = `/quiz?subject=${subject.id}&name=${encodeURIComponent(subject.name)}`;
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: subject.color || '#666' }}
                      >
                        {subject.name.charAt(0)}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {subject.name}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Study Notes Card - spans 3 columns */}
              <Card className="col-span-full md:col-span-3 lg:col-span-3 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <FileText className="h-5 w-5" />
                    <span>Study Notes</span>
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Access comprehensive study materials for any subject and topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 mb-4">
                    Get AI-generated study notes tailored to your level and examination system. Select any subject to browse topics and start studying.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 6).map((subject) => (
                      <Button
                        key={subject.id}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => handleStudyNotesClick(subject)}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        {subject.name}
                      </Button>
                    ))}
                    {subjects.length > 6 && (
                      <span className="text-sm text-blue-500 flex items-center">
                        +{subjects.length - 6} more subjects
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="mb-6">
              <CardContent className="text-center py-8">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No subjects available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Your Progress</span>
              </CardTitle>
              <CardDescription>
                See how well you're doing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userStats && userStats.totalQuizzes > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">{userStats.totalSparks}</div>
                      <div className="text-xs text-gray-600">Total Sparks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-500">{userStats.totalQuizzes}</div>
                      <div className="text-xs text-gray-600">Quizzes Completed</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{userStats.averageScore}%</div>
                      <div className="text-xs text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{userStats.currentStreak}</div>
                      <div className="text-xs text-gray-600">Current Streak</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Take your first quiz to see your progress!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5" />
              <span>Welcome to Daily Sparks!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100">
              Your profile-based learning platform is now ready. Start taking quizzes to earn sparks and build your learning streaks!
            </p>
          </CardContent>
        </Card>

        {/* Topic Selection Modal for Study Notes */}
        <Dialog open={showTopicModal} onOpenChange={setShowTopicModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Select Topic for Study Notes</span>
              </DialogTitle>
              <DialogDescription>
                Choose a topic from <strong>{selectedSubjectForNotes?.name}</strong> to access study notes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {topicsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading topics...</p>
                </div>
              ) : topics.length > 0 ? (
                <div className="grid gap-3">
                  {topics.map((topic) => (
                    <Card 
                      key={topic.id}
                      className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] border hover:border-blue-300"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {topic.description}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No topics available yet</p>
                  <p className="text-sm text-gray-400">
                    Topics for {selectedSubjectForNotes?.name} haven't been added yet.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}