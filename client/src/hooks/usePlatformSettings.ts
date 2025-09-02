import { useSettings } from "@/contexts/SettingsContext";

export function usePlatformSettings() {
  const { settings } = useSettings();
  
  return {
    platformName: settings?.general?.platformName || "Daily Sparks",
    tagline: settings?.general?.tagline || "TikTok Simple, Harvard Smart",
    colors: {
      primary: settings?.general?.primaryColor || "#3b82f6",
      secondary: settings?.general?.secondaryColor || "#1e40af", 
      accent: settings?.general?.accentColor || "#f59e0b",
    },
    supportEmail: settings?.general?.supportEmail || "support@dailysparks.com",
    maintenanceMode: settings?.general?.maintenanceMode || false,
    quiz: {
      sparksPerCorrectAnswer: settings?.quiz?.sparksPerCorrectAnswer || 5,
      timePerQuestionSeconds: settings?.quiz?.timePerQuestionSeconds || 45,
      minQuestionsPerQuiz: settings?.quiz?.minQuestionsPerQuiz || 5,
      maxQuestionsPerQuiz: settings?.quiz?.maxQuestionsPerQuiz || 15,
      showCorrectAnswers: settings?.quiz?.showCorrectAnswers !== false,
      showExplanations: settings?.quiz?.showExplanations !== false,
      randomizeQuestions: settings?.quiz?.randomizeQuestions !== false,
    },
    notifications: settings?.notifications || {
      emailNotificationsEnabled: true,
      dailyReminderEnabled: true,
      streakReminderEnabled: true,
      achievementNotificationsEnabled: true,
    }
  };
}