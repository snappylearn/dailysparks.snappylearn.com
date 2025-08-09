import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Globe, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Zap, 
  Users, 
  BookOpen,
  Save,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const settingsSchema = z.object({
  platformName: z.string().min(1, "Platform name is required"),
  platformDescription: z.string().min(1, "Description is required"),
  supportEmail: z.string().email("Valid email is required"),
  maxQuizQuestions: z.number().min(5).max(100),
  defaultTimeLimit: z.number().min(5).max(180),
  sparksPerCorrectAnswer: z.number().min(1).max(20),
  enableNotifications: z.boolean(),
  enableLeaderboard: z.boolean(),
  requireEmailVerification: z.boolean(),
  maintenanceMode: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("general");
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformName: "Daily Sparks",
      platformDescription: "AI-powered revision platform for Kenyan students",
      supportEmail: "support@dailysparks.com",
      maxQuizQuestions: 30,
      defaultTimeLimit: 30,
      sparksPerCorrectAnswer: 10,
      enableNotifications: true,
      enableLeaderboard: true,
      requireEmailVerification: false,
      maintenanceMode: false,
    }
  });

  const onSubmit = (data: SettingsFormData) => {
    toast({
      title: "Settings Updated",
      description: "Platform settings have been saved successfully.",
    });
    console.log("Settings data:", data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
          <p className="text-muted-foreground">
            Configure platform behavior, features, and integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button form="settings-form" type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Quiz Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <TabsContent value="general" className="space-y-6">
              {/* Platform Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Platform Information
                  </CardTitle>
                  <CardDescription>
                    Basic platform configuration and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platformName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name displayed across the platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platformDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormDescription>
                          Brief description shown on landing page and meta tags
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address for user support and contact
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Feature Toggles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Feature Toggles
                  </CardTitle>
                  <CardDescription>
                    Enable or disable platform features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enableLeaderboard"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Leaderboard</FormLabel>
                          <FormDescription>
                            Show public leaderboard and rankings
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Push Notifications</FormLabel>
                          <FormDescription>
                            Send push notifications to users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Quiz Configuration
                  </CardTitle>
                  <CardDescription>
                    Default quiz settings and scoring rules
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxQuizQuestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Questions per Quiz</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum questions allowed in a single quiz
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="defaultTimeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Default time limit for quizzes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sparksPerCorrectAnswer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sparks per Correct Answer</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Base sparks awarded for each correct answer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">AI Quiz Generation Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>OpenAI Model</Label>
                        <Select defaultValue="gpt-4o">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Generation Temperature</Label>
                        <Select defaultValue="0.7">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.3">Conservative (0.3)</SelectItem>
                            <SelectItem value="0.7">Balanced (0.7)</SelectItem>
                            <SelectItem value="1.0">Creative (1.0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    User Management & Security
                  </CardTitle>
                  <CardDescription>
                    User registration and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="requireEmailVerification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Verification</FormLabel>
                          <FormDescription>
                            Require users to verify email before accessing platform
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Registration Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default User Role</Label>
                        <Select defaultValue="student">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Account Approval</Label>
                        <Select defaultValue="automatic">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure automated email notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { key: "welcome", label: "Welcome Email", desc: "Send welcome email to new users" },
                      { key: "quiz_completion", label: "Quiz Completion", desc: "Notify users when they complete a quiz" },
                      { key: "streak_reminder", label: "Streak Reminders", desc: "Remind users to maintain their learning streak" },
                      { key: "leaderboard", label: "Leaderboard Updates", desc: "Weekly leaderboard position updates" },
                      { key: "new_content", label: "New Content", desc: "Notify about new quizzes and subjects" },
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">{notification.label}</Label>
                          <p className="text-sm text-muted-foreground">{notification.desc}</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>
                    Database, caching, and system maintenance settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-orange-200">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Maintenance Mode
                          </FormLabel>
                          <FormDescription>
                            Enable maintenance mode to prevent user access during updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Database Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Connection</span>
                          <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Storage Used</span>
                          <span className="text-sm font-medium">2.3 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Records</span>
                          <span className="text-sm font-medium">15,847</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">API Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Response Time</span>
                          <Badge className="bg-green-100 text-green-800">245ms</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Uptime</span>
                          <span className="text-sm font-medium">99.9%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Error Rate</span>
                          <span className="text-sm font-medium">0.1%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">System Actions</h4>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        Clear Cache
                      </Button>
                      <Button variant="outline">
                        Run Database Cleanup
                      </Button>
                      <Button variant="outline">
                        Export System Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </form>
        </Form>
      </Tabs>
    </div>
  );
}