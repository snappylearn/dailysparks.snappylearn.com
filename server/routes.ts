import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertQuizSessionSchema, insertUserAnswerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding route
  app.post('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { examType, form, school } = req.body;
      
      if (!examType || !form) {
        return res.status(400).json({ message: "Exam type and form are required" });
      }

      const user = await storage.updateUserOnboarding(userId, examType, form, school);
      res.json(user);
    } catch (error) {
      console.error("Error updating onboarding:", error);
      res.status(500).json({ message: "Failed to update onboarding" });
    }
  });

  // Get subjects for user's exam type
  app.get('/api/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.examType) {
        return res.status(400).json({ message: "User not found or onboarding not completed" });
      }

      const subjects = await storage.getSubjects(user.examType);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get topics for a subject
  app.get('/api/subjects/:subjectId/topics', isAuthenticated, async (req: any, res) => {
    try {
      const { subjectId } = req.params;
      const { form, term } = req.query;
      
      const topics = await storage.getTopicsBySubject(subjectId, form, term);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Start a quiz session
  app.post('/api/quiz/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subjectId, quizType, topicId, term } = req.body;

      if (!subjectId || !quizType) {
        return res.status(400).json({ message: "Subject ID and quiz type are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create quiz session
      const quizSession = await storage.createQuizSession({
        userId,
        subjectId,
        quizType,
        topicId: quizType === 'topical' ? topicId : undefined,
        term: quizType === 'term' ? term : undefined,
        totalQuestions: 30,
      });

      // Get questions based on quiz type
      let questions;
      switch (quizType) {
        case 'random':
          questions = await storage.getRandomQuestions(subjectId, user.form, 30);
          break;
        case 'topical':
          if (!topicId) {
            return res.status(400).json({ message: "Topic ID required for topical quiz" });
          }
          questions = await storage.getQuestionsByTopic(topicId, 30);
          break;
        case 'term':
          const termToUse = term || user.currentTerm || 'Term 1';
          questions = await storage.getTermQuestions(subjectId, user.form, termToUse, 30);
          break;
        default:
          return res.status(400).json({ message: "Invalid quiz type" });
      }

      if (questions.length === 0) {
        return res.status(404).json({ message: "No questions found for the selected criteria" });
      }

      res.json({
        quizSession,
        questions: questions.slice(0, 30), // Ensure exactly 30 questions
      });
    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz" });
    }
  });

  // Submit an answer
  app.post('/api/quiz/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { quizSessionId, questionId, userAnswer, timeSpent } = req.body;

      if (!quizSessionId || !questionId || !userAnswer) {
        return res.status(400).json({ message: "Quiz session ID, question ID, and user answer are required" });
      }

      // Get the question to check correct answer
      const questions = await storage.getQuestionsByTopic('', 1); // We'll need to modify this
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const isCorrect = question.correctAnswer === userAnswer;

      // Save user answer
      const answer = await storage.createUserAnswer({
        quizSessionId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
      });

      res.json({
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        sparksEarned: isCorrect ? 10 : 0,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Complete quiz
  app.post('/api/quiz/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { quizSessionId } = req.body;

      if (!quizSessionId) {
        return res.status(400).json({ message: "Quiz session ID is required" });
      }

      // Get quiz answers
      const answers = await storage.getQuizAnswers(quizSessionId);
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalQuestions = answers.length;
      
      // Calculate sparks earned
      let sparksEarned = correctAnswers * 10;
      if (correctAnswers === totalQuestions) {
        sparksEarned += 500; // Perfect quiz bonus
      }

      // Update quiz session
      const updatedSession = await storage.updateQuizSession(quizSessionId, {
        correctAnswers,
        sparksEarned,
        completed: true,
        completedAt: new Date(),
      });

      // Update user sparks and streak
      await storage.updateUserSparks(userId, sparksEarned);
      const updatedUser = await storage.updateUserStreak(userId);

      // Calculate grade
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      let grade = 'F';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B+';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C+';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      res.json({
        score: `${correctAnswers}/${totalQuestions}`,
        percentage,
        grade,
        sparksEarned,
        currentStreak: updatedUser.streak,
        totalSparks: updatedUser.sparks,
      });
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Get today's challenge
  app.get('/api/challenge/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenge = await storage.getTodaysChallenge();
      
      if (!challenge) {
        return res.status(404).json({ message: "No challenge for today" });
      }

      const progress = await storage.getUserChallengeProgress(userId, challenge.id);
      
      res.json({
        challenge,
        progress: progress || { currentValue: 0, completed: false },
      });
    } catch (error) {
      console.error("Error fetching today's challenge:", error);
      res.status(500).json({ message: "Failed to fetch today's challenge" });
    }
  });

  // Get user stats
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get subject performance
  app.get('/api/subjects/:subjectId/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subjectId } = req.params;
      
      const performance = await storage.getSubjectPerformance(userId, subjectId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching subject performance:", error);
      res.status(500).json({ message: "Failed to fetch subject performance" });
    }
  });

  // Seed initial data (for development)
  app.post('/api/seed', async (req, res) => {
    try {
      // Create KCSE subjects
      const mathSubject = await storage.createSubject({
        name: 'Mathematics',
        code: 'MATH',
        examType: 'KCSE',
        icon: 'fas fa-calculator',
        color: 'from-spark-blue to-spark-turquoise',
      });

      const physicsSubject = await storage.createSubject({
        name: 'Physics',
        code: 'PHYS',
        examType: 'KCSE',
        icon: 'fas fa-atom',
        color: 'from-spark-mint to-spark-turquoise',
      });

      // Create topics for Form 1 Mathematics
      const algebraTopic = await storage.createTopic({
        subjectId: mathSubject.id,
        name: 'Algebra I',
        form: 'Form 1',
        term: 'Term 1',
        order: 1,
      });

      // Create sample questions
      await storage.createQuestion({
        topicId: algebraTopic.id,
        questionText: 'If 3x + 7 = 22, what is the value of x?',
        optionA: '3',
        optionB: '5',
        optionC: '7',
        optionD: '15',
        correctAnswer: 'B',
        explanation: 'To solve 3x + 7 = 22, subtract 7 from both sides: 3x = 15, then divide by 3: x = 5',
        difficulty: 'easy',
      });

      await storage.createQuestion({
        topicId: algebraTopic.id,
        questionText: 'Simplify: 2x + 3x - x',
        optionA: '4x',
        optionB: '5x',
        optionC: '6x',
        optionD: '3x',
        correctAnswer: 'A',
        explanation: 'Combine like terms: 2x + 3x - x = (2 + 3 - 1)x = 4x',
        difficulty: 'easy',
      });

      // Create today's challenge
      const today = new Date().toISOString().split('T')[0];
      await storage.createDailyChallenge({
        date: today,
        title: "Master 10 Questions",
        description: "Answer 10 questions correctly today",
        targetValue: 10,
        sparksReward: 200,
      });

      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
