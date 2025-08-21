import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Zap, Bell, Save } from "lucide-react";

export default function PlatformSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch all settings
  const { data: generalSettings, isLoading: loadingGeneral } = useQuery({
    queryKey: ['/api/admin/settings/general'],
  });

  const { data: quizSettings, isLoading: loadingQuiz } = useQuery({
    queryKey: ['/api/admin/settings/quiz'],
  });

  const { data: notificationSettings, isLoading: loadingNotifications } = useQuery({
    queryKey: ['/api/admin/settings/notifications'],
  });

  // Update mutations
  const updateGeneralSettings = useMutation({
    mutationFn: (data: any) => fetch('/api/admin/settings/general', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/general'] });
      toast({ title: "General settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update general settings", variant: "destructive" });
    },
  });

  const updateQuizSettings = useMutation({
    mutationFn: (data: any) => fetch('/api/admin/settings/quiz', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/quiz'] });
      toast({ title: "Quiz settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update quiz settings", variant: "destructive" });
    },
  });

  const updateNotificationSettings = useMutation({
    mutationFn: (data: any) => fetch('/api/admin/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/notifications'] });
      toast({ title: "Notification settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update notification settings", variant: "destructive" });
    },
  });

  const handleGeneralSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      platformName: formData.get('platformName') as string,
      tagline: formData.get('tagline') as string,
      primaryColor: formData.get('primaryColor') as string,
      secondaryColor: formData.get('secondaryColor') as string,
      accentColor: formData.get('accentColor') as string,
      supportEmail: formData.get('supportEmail') as string,
      maintenanceMode: formData.get('maintenanceMode') === 'on',
      maxUsers: parseInt(formData.get('maxUsers') as string),
      timezone: formData.get('timezone') as string,
      language: formData.get('language') as string,
    };
    updateGeneralSettings.mutate(data);
  };

  const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      sparksPerCorrectAnswer: parseInt(formData.get('sparksPerCorrectAnswer') as string),
      accuracyBonusThreshold: parseFloat(formData.get('accuracyBonusThreshold') as string),
      accuracyBonusMultiplier: parseFloat(formData.get('accuracyBonusMultiplier') as string),
      goodAccuracyThreshold: parseFloat(formData.get('goodAccuracyThreshold') as string),
      goodAccuracyMultiplier: parseFloat(formData.get('goodAccuracyMultiplier') as string),
      maxQuestionsPerQuiz: parseInt(formData.get('maxQuestionsPerQuiz') as string),
      minQuestionsPerQuiz: parseInt(formData.get('minQuestionsPerQuiz') as string),
      timePerQuestionSeconds: parseInt(formData.get('timePerQuestionSeconds') as string),
      allowSkipQuestions: formData.get('allowSkipQuestions') === 'on',
      showCorrectAnswers: formData.get('showCorrectAnswers') === 'on',
      showExplanations: formData.get('showExplanations') === 'on',
      randomizeQuestions: formData.get('randomizeQuestions') === 'on',
      randomizeOptions: formData.get('randomizeOptions') === 'on',
    };
    updateQuizSettings.mutate(data);
  };

  const handleNotificationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      emailNotificationsEnabled: formData.get('emailNotificationsEnabled') === 'on',
      dailyReminderEnabled: formData.get('dailyReminderEnabled') === 'on',
      dailyReminderTime: formData.get('dailyReminderTime') as string,
      streakReminderEnabled: formData.get('streakReminderEnabled') === 'on',
      achievementNotificationsEnabled: formData.get('achievementNotificationsEnabled') === 'on',
      leaderboardUpdatesEnabled: formData.get('leaderboardUpdatesEnabled') === 'on',
      weeklyProgressReportEnabled: formData.get('weeklyProgressReportEnabled') === 'on',
      weeklyProgressReportDay: parseInt(formData.get('weeklyProgressReportDay') as string),
      challengeNotificationsEnabled: formData.get('challengeNotificationsEnabled') === 'on',
      sparkBoostNotificationsEnabled: formData.get('sparkBoostNotificationsEnabled') === 'on',
      maintenanceNotificationsEnabled: formData.get('maintenanceNotificationsEnabled') === 'on',
    };
    updateNotificationSettings.mutate(data);
  };

  if (loadingGeneral || loadingQuiz || loadingNotifications) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Platform Settings</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Platform Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quiz Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      name="platformName"
                      defaultValue={generalSettings?.platformName || "Daily Sparks"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      defaultValue={generalSettings?.tagline || "TikTok Simple, Harvard Smart"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={generalSettings?.primaryColor || "#3b82f6"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      defaultValue={generalSettings?.secondaryColor || "#1e40af"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <Input
                      id="accentColor"
                      name="accentColor"
                      type="color"
                      defaultValue={generalSettings?.accentColor || "#f59e0b"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      defaultValue={generalSettings?.supportEmail || "support@dailysparks.com"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Max Users</Label>
                    <Input
                      id="maxUsers"
                      name="maxUsers"
                      type="number"
                      defaultValue={generalSettings?.maxUsers || 10000}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      name="timezone"
                      defaultValue={generalSettings?.timezone || "Africa/Nairobi"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      name="language"
                      defaultValue={generalSettings?.language || "en"}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    name="maintenanceMode"
                    defaultChecked={generalSettings?.maintenanceMode || false}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>

                <Button type="submit" className="flex items-center gap-2" disabled={updateGeneralSettings.isPending}>
                  <Save className="h-4 w-4" />
                  {updateGeneralSettings.isPending ? "Saving..." : "Save General Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuizSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sparksPerCorrectAnswer">Sparks per Correct Answer</Label>
                    <Input
                      id="sparksPerCorrectAnswer"
                      name="sparksPerCorrectAnswer"
                      type="number"
                      min="1"
                      defaultValue={quizSettings?.sparksPerCorrectAnswer || 5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timePerQuestionSeconds">Time per Question (seconds)</Label>
                    <Input
                      id="timePerQuestionSeconds"
                      name="timePerQuestionSeconds"
                      type="number"
                      min="10"
                      defaultValue={quizSettings?.timePerQuestionSeconds || 45}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minQuestionsPerQuiz">Min Questions per Quiz</Label>
                    <Input
                      id="minQuestionsPerQuiz"
                      name="minQuestionsPerQuiz"
                      type="number"
                      min="1"
                      defaultValue={quizSettings?.minQuestionsPerQuiz || 5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxQuestionsPerQuiz">Max Questions per Quiz</Label>
                    <Input
                      id="maxQuestionsPerQuiz"
                      name="maxQuestionsPerQuiz"
                      type="number"
                      min="1"
                      defaultValue={quizSettings?.maxQuestionsPerQuiz || 15}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Accuracy Bonuses</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accuracyBonusThreshold">High Accuracy Threshold (%)</Label>
                      <Input
                        id="accuracyBonusThreshold"
                        name="accuracyBonusThreshold"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        defaultValue={quizSettings?.accuracyBonusThreshold || 0.80}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accuracyBonusMultiplier">High Accuracy Multiplier</Label>
                      <Input
                        id="accuracyBonusMultiplier"
                        name="accuracyBonusMultiplier"
                        type="number"
                        step="0.01"
                        min="1"
                        defaultValue={quizSettings?.accuracyBonusMultiplier || 1.50}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goodAccuracyThreshold">Good Accuracy Threshold (%)</Label>
                      <Input
                        id="goodAccuracyThreshold"
                        name="goodAccuracyThreshold"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        defaultValue={quizSettings?.goodAccuracyThreshold || 0.60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goodAccuracyMultiplier">Good Accuracy Multiplier</Label>
                      <Input
                        id="goodAccuracyMultiplier"
                        name="goodAccuracyMultiplier"
                        type="number"
                        step="0.01"
                        min="1"
                        defaultValue={quizSettings?.goodAccuracyMultiplier || 1.20}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quiz Behavior</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowSkipQuestions"
                        name="allowSkipQuestions"
                        defaultChecked={quizSettings?.allowSkipQuestions || false}
                      />
                      <Label htmlFor="allowSkipQuestions">Allow Skip Questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showCorrectAnswers"
                        name="showCorrectAnswers"
                        defaultChecked={quizSettings?.showCorrectAnswers !== false}
                      />
                      <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showExplanations"
                        name="showExplanations"
                        defaultChecked={quizSettings?.showExplanations !== false}
                      />
                      <Label htmlFor="showExplanations">Show Explanations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="randomizeQuestions"
                        name="randomizeQuestions"
                        defaultChecked={quizSettings?.randomizeQuestions !== false}
                      />
                      <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomizeOptions"
                      name="randomizeOptions"
                      defaultChecked={quizSettings?.randomizeOptions !== false}
                    />
                    <Label htmlFor="randomizeOptions">Randomize Answer Options</Label>
                  </div>
                </div>

                <Button type="submit" className="flex items-center gap-2" disabled={updateQuizSettings.isPending}>
                  <Save className="h-4 w-4" />
                  {updateQuizSettings.isPending ? "Saving..." : "Save Quiz Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Email Notifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailNotificationsEnabled"
                        name="emailNotificationsEnabled"
                        defaultChecked={notificationSettings?.emailNotificationsEnabled !== false}
                      />
                      <Label htmlFor="emailNotificationsEnabled">Enable Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="dailyReminderEnabled"
                        name="dailyReminderEnabled"
                        defaultChecked={notificationSettings?.dailyReminderEnabled !== false}
                      />
                      <Label htmlFor="dailyReminderEnabled">Daily Study Reminders</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyReminderTime">Daily Reminder Time</Label>
                    <Input
                      id="dailyReminderTime"
                      name="dailyReminderTime"
                      type="time"
                      defaultValue={notificationSettings?.dailyReminderTime || "18:00"}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Achievement Notifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="streakReminderEnabled"
                        name="streakReminderEnabled"
                        defaultChecked={notificationSettings?.streakReminderEnabled !== false}
                      />
                      <Label htmlFor="streakReminderEnabled">Streak Reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="achievementNotificationsEnabled"
                        name="achievementNotificationsEnabled"
                        defaultChecked={notificationSettings?.achievementNotificationsEnabled !== false}
                      />
                      <Label htmlFor="achievementNotificationsEnabled">Achievement Notifications</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="leaderboardUpdatesEnabled"
                        name="leaderboardUpdatesEnabled"
                        defaultChecked={notificationSettings?.leaderboardUpdatesEnabled !== false}
                      />
                      <Label htmlFor="leaderboardUpdatesEnabled">Leaderboard Updates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="challengeNotificationsEnabled"
                        name="challengeNotificationsEnabled"
                        defaultChecked={notificationSettings?.challengeNotificationsEnabled !== false}
                      />
                      <Label htmlFor="challengeNotificationsEnabled">Challenge Notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Progress Reports</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="weeklyProgressReportEnabled"
                        name="weeklyProgressReportEnabled"
                        defaultChecked={notificationSettings?.weeklyProgressReportEnabled !== false}
                      />
                      <Label htmlFor="weeklyProgressReportEnabled">Weekly Progress Reports</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weeklyProgressReportDay">Report Day (0=Sunday, 6=Saturday)</Label>
                      <Input
                        id="weeklyProgressReportDay"
                        name="weeklyProgressReportDay"
                        type="number"
                        min="0"
                        max="6"
                        defaultValue={notificationSettings?.weeklyProgressReportDay || 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Notifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sparkBoostNotificationsEnabled"
                        name="sparkBoostNotificationsEnabled"
                        defaultChecked={notificationSettings?.sparkBoostNotificationsEnabled !== false}
                      />
                      <Label htmlFor="sparkBoostNotificationsEnabled">Spark Boost Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceNotificationsEnabled"
                        name="maintenanceNotificationsEnabled"
                        defaultChecked={notificationSettings?.maintenanceNotificationsEnabled !== false}
                      />
                      <Label htmlFor="maintenanceNotificationsEnabled">Maintenance Notifications</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="flex items-center gap-2" disabled={updateNotificationSettings.isPending}>
                  <Save className="h-4 w-4" />
                  {updateNotificationSettings.isPending ? "Saving..." : "Save Notification Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}