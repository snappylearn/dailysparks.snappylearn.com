import { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface PlatformSettings {
  general: {
    platformName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    supportEmail: string;
    maxUsers: number;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  quiz: {
    sparksPerCorrectAnswer: number;
    timePerQuestionSeconds: number;
    minQuestionsPerQuiz: number;
    maxQuestionsPerQuiz: number;
    accuracyBonusThreshold: number;
    accuracyBonusMultiplier: number;
    goodAccuracyThreshold: number;
    goodAccuracyMultiplier: number;
    allowSkipQuestions: boolean;
    showCorrectAnswers: boolean;
    showExplanations: boolean;
    randomizeQuestions: boolean;
    randomizeAnswerOptions: boolean;
  };
  notifications: {
    emailNotificationsEnabled: boolean;
    dailyReminderEnabled: boolean;
    dailyReminderTime: string;
    streakReminderEnabled: boolean;
    achievementNotificationsEnabled: boolean;
    leaderboardUpdatesEnabled: boolean;
    weeklyProgressReportsEnabled: boolean;
    weeklyProgressReportDay: string;
    challengeNotificationsEnabled: boolean;
    sparkBoostNotificationsEnabled: boolean;
    maintenanceNotificationsEnabled: boolean;
  };
}

interface SettingsContextType {
  settings: PlatformSettings | null;
  isLoading: boolean;
  applyTheme: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: generalSettings, isLoading: generalLoading } = useQuery({
    queryKey: ["/api/admin/settings/general"],
  });

  const { data: quizSettings, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/admin/settings/quiz"],
  });

  const { data: notificationSettings, isLoading: notificationLoading } = useQuery({
    queryKey: ["/api/admin/settings/notifications"],
  });

  const isLoading = generalLoading || quizLoading || notificationLoading;

  const settings: PlatformSettings | null = (generalSettings && quizSettings && notificationSettings) ? {
    general: {
      platformName: generalSettings.platformName || "Daily Sparks",
      tagline: generalSettings.tagline || "TikTok Simple, Harvard Smart",
      primaryColor: generalSettings.primaryColor || "#3b82f6",
      secondaryColor: generalSettings.secondaryColor || "#1e40af",
      accentColor: generalSettings.accentColor || "#f59e0b",
      supportEmail: generalSettings.supportEmail || "support@dailysparks.com",
      maxUsers: generalSettings.maxUsers || 10000,
      timezone: generalSettings.timezone || "UTC",
      language: generalSettings.language || "en",
      maintenanceMode: generalSettings.maintenanceMode || false,
    },
    quiz: {
      sparksPerCorrectAnswer: quizSettings.sparksPerCorrectAnswer || 5,
      timePerQuestionSeconds: quizSettings.timePerQuestionSeconds || 45,
      minQuestionsPerQuiz: quizSettings.minQuestionsPerQuiz || 5,
      maxQuestionsPerQuiz: quizSettings.maxQuestionsPerQuiz || 15,
      accuracyBonusThreshold: quizSettings.accuracyBonusThreshold || 80,
      accuracyBonusMultiplier: quizSettings.accuracyBonusMultiplier || 1.5,
      goodAccuracyThreshold: quizSettings.goodAccuracyThreshold || 60,
      goodAccuracyMultiplier: quizSettings.goodAccuracyMultiplier || 1.2,
      allowSkipQuestions: quizSettings.allowSkipQuestions !== false,
      showCorrectAnswers: quizSettings.showCorrectAnswers !== false,
      showExplanations: quizSettings.showExplanations !== false,
      randomizeQuestions: quizSettings.randomizeQuestions !== false,
      randomizeAnswerOptions: quizSettings.randomizeAnswerOptions !== false,
    },
    notifications: {
      emailNotificationsEnabled: notificationSettings.emailNotificationsEnabled !== false,
      dailyReminderEnabled: notificationSettings.dailyReminderEnabled !== false,
      dailyReminderTime: notificationSettings.dailyReminderTime || "18:00",
      streakReminderEnabled: notificationSettings.streakReminderEnabled !== false,
      achievementNotificationsEnabled: notificationSettings.achievementNotificationsEnabled !== false,
      leaderboardUpdatesEnabled: notificationSettings.leaderboardUpdatesEnabled !== false,
      weeklyProgressReportsEnabled: notificationSettings.weeklyProgressReportsEnabled !== false,
      weeklyProgressReportDay: notificationSettings.weeklyProgressReportDay || "Sunday",
      challengeNotificationsEnabled: notificationSettings.challengeNotificationsEnabled !== false,
      sparkBoostNotificationsEnabled: notificationSettings.sparkBoostNotificationsEnabled !== false,
      maintenanceNotificationsEnabled: notificationSettings.maintenanceNotificationsEnabled !== false,
    },
  } : null;

  const applyTheme = () => {
    if (!settings?.general) return;

    // Apply CSS custom properties for colors
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.general.primaryColor);
    root.style.setProperty('--secondary', settings.general.secondaryColor);
    root.style.setProperty('--accent', settings.general.accentColor);

    // Update document title
    document.title = settings.general.platformName;
  };

  useEffect(() => {
    applyTheme();
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, applyTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export type { PlatformSettings };