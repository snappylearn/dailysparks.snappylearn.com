import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateQuestions } from "./aiService";
import { insertQuizSessionSchema, insertUserAnswerSchema, topics, questions } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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

  // Examination system routes
  app.get('/api/examination-systems', async (req, res) => {
    try {
      const systems = await storage.getExaminationSystems();
      res.json(systems);
    } catch (error) {
      console.error("Error fetching examination systems:", error);
      res.status(500).json({ message: "Failed to fetch examination systems" });
    }
  });

  // Level routes - All levels for admin filtering
  app.get('/api/levels', async (req, res) => {
    try {
      const levels = await storage.getAllLevels();
      res.json(levels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  // Level routes - By system
  app.get('/api/levels/:systemId', async (req, res) => {
    try {
      const { systemId } = req.params;
      const levels = await storage.getLevelsBySystem(systemId);
      res.json(levels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  // Terms routes
  app.get('/api/terms', async (req, res) => {
    try {
      const terms = await storage.getTerms();
      res.json(terms);
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Profile update routes
  app.patch('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.claims.sub;
      
      console.log('Updating profile:', id, 'with data:', updateData);
      
      // First verify the profile belongs to the user
      const currentProfile = await storage.getProfile(id);
      if (!currentProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (currentProfile.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this profile" });
      }
      
      const updatedProfile = await storage.updateProfile(id, updateData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile: " + error.message });
    }
  });

  // Enhanced Quiz API Routes
  
  // Generate and start a new quiz
  app.post('/api/quizzes/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { 
        examinationSystemId, 
        levelId, 
        subjectId, 
        quizType, 
        topicId, 
        termId,
        questionCount = 15,
        timeLimit = 30 
      } = req.body;

      // Get user's active profile
      const profiles = await storage.getUserProfiles(userId);
      const currentProfile = profiles.find(p => p.isDefault) || profiles[0];
      
      if (!currentProfile) {
        return res.status(400).json({ message: "No profile found" });
      }

      const params = {
        examinationSystemId,
        levelId,
        subjectId,
        quizType,
        topicId,
        termId,
        questionCount,
        timeLimit
      };

      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionId = await LLMQuizEngine.generateQuiz(params, userId, currentProfile.id);
      
      res.json({ sessionId, message: "Quiz generated successfully" });
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz: " + error.message });
    }
  });

  // Get quiz session details
  app.get('/api/quiz-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.claims.sub;
      
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionData = await LLMQuizEngine.getQuizSession(sessionId);
      
      // Verify session belongs to user
      const profiles = await storage.getUserProfiles(userId);
      const userProfileIds = profiles.map(p => p.id);
      
      // Note: Would need to add profileId check in QuizEngine.getQuizSession
      
      res.json(sessionData);
    } catch (error) {
      console.error("Error fetching quiz session:", error);
      res.status(500).json({ message: "Failed to fetch quiz session: " + error.message });
    }
  });

  // Submit answer for quiz question
  app.post('/api/quiz-sessions/:sessionId/answers', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, choiceId, answer, timeSpent } = req.body;
      
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const result = await LLMQuizEngine.submitAnswer(sessionId, questionId, choiceId, answer, timeSpent || 0);
      
      res.json({ isCorrect: result.isCorrect, message: "Answer submitted successfully" });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer: " + error.message });
    }
  });

  // Complete quiz session
  app.post('/api/quiz-sessions/:sessionId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const results = await LLMQuizEngine.completeQuiz(sessionId);
      
      res.json(results);
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz: " + error.message });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Admin analytics and metrics
  app.get('/api/admin/metrics', isAuthenticated, async (req: any, res) => {
    try {
      // Basic metrics for admin dashboard
      const totalUsers = await storage.getTotalUsersCount();
      const totalQuizzes = await storage.getTotalQuizzesCount();
      const totalSessions = await storage.getTotalSessionsCount();
      const avgScore = await storage.getAverageScore();
      
      res.json({
        totalUsers,
        totalQuizzes, 
        totalSessions,
        avgScore
      });
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Admin quiz list with filters and analytics
  app.get('/api/admin/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const quizzes = await storage.getAdminQuizList(req.query);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching admin quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get quiz details with questions
  app.get('/api/admin/quizzes/:quizId', isAuthenticated, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const quizWithQuestions = await storage.getQuizWithQuestions(quizId);
      res.json(quizWithQuestions);
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      res.status(500).json({ message: "Failed to fetch quiz details" });
    }
  });

  // Update quiz
  app.put('/api/admin/quizzes/:quizId', isAuthenticated, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const updateData = req.body;
      
      const updatedQuiz = await storage.updateQuiz(quizId, updateData);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Admin generate quiz endpoint
  app.post('/api/admin/generate-quiz', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizData = req.body;
      
      // Use LLM to generate quiz with admin privileges
      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionId = await LLMQuizEngine.generateQuizForAdmin(quizData, userId);
      
      res.json({ 
        quizId: sessionId, 
        message: "Quiz template created successfully by admin" 
      });
    } catch (error: any) {
      console.error("Error generating admin quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz: " + (error?.message || 'Unknown error') });
    }
  });

  // Recent activity for admin dashboard
  app.get('/api/admin/recent-activity', isAuthenticated, async (req: any, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Admin leaderboard
  app.get('/api/admin/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getTopPerformers();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching admin leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // ===== END ADMIN ROUTES =====

  // Get quiz types
  app.get('/api/quiz-types', async (req, res) => {
    try {
      const quizTypes = await storage.getQuizTypes();
      res.json(quizTypes);
    } catch (error) {
      console.error("Error fetching quiz types:", error);
      res.status(500).json({ message: "Failed to fetch quiz types" });
    }
  });

  // Backward compatibility: Keep the old quiz API working alongside the new one
  app.post('/api/quiz/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileId, quizType, subjectId, topicId, termId } = req.body;
      
      console.log('Legacy quiz start request:', req.body);
      
      // Get profile data
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(400).json({ message: "Profile not found" });
      }

      // Use the enhanced quiz generation
      const params = {
        examinationSystemId: profile.examinationSystemId,
        levelId: profile.levelId,
        subjectId,
        quizType,
        topicId,
        termId,
        questionCount: 15,
        timeLimit: 30
      };

      const { LLMQuizEngine } = await import('./llmQuizEngine');
      const sessionId = await LLMQuizEngine.generateQuiz(params, userId, profileId);
      
      // Get the session data to return in legacy format
      const sessionData = await LLMQuizEngine.getQuizSession(sessionId);
      
      // Transform to legacy format
      const legacyResponse = {
        sessionId: sessionData.id,
        questions: sessionData.questions.map((q: any) => ({
          id: q.id,
          questionText: q.content,
          optionA: q.choices?.[0]?.content || '',
          optionB: q.choices?.[1]?.content || '',
          optionC: q.choices?.[2]?.content || '',
          optionD: q.choices?.[3]?.content || '',
          correctAnswer: q.choices?.find((c: any) => c.isCorrect)?.orderIndex === 1 ? 'A' : 
                        q.choices?.find((c: any) => c.isCorrect)?.orderIndex === 2 ? 'B' :
                        q.choices?.find((c: any) => c.isCorrect)?.orderIndex === 3 ? 'C' : 'D',
          explanation: q.explanation
        })),
        totalQuestions: sessionData.totalQuestions
      };
      
      console.log('Returning legacy quiz response:', legacyResponse);
      res.json(legacyResponse);
    } catch (error) {
      console.error("Error starting legacy quiz:", error);
      res.status(500).json({ message: "Failed to start quiz: " + error.message });
    }
  });

  // Profile routes
  app.get('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profiles = await storage.getUserProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { examinationSystemId, levelId } = req.body;
      
      const profile = await storage.createProfile({
        userId,
        examinationSystemId,
        levelId,
      });

      // If this is the user's first profile, set it as default
      const userProfiles = await storage.getUserProfiles(userId);
      if (userProfiles.length === 1) {
        await storage.setDefaultProfile(userId, profile.id);
      }

      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profiles/:profileId/default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileId } = req.params;
      
      const user = await storage.setDefaultProfile(userId, profileId);
      res.json(user);
    } catch (error) {
      console.error("Error setting default profile:", error);
      res.status(500).json({ message: "Failed to set default profile" });
    }
  });

  // Subject routes - All subjects for admin filtering
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Subject routes - By system
  app.get('/api/subjects/:systemId', async (req, res) => {
    try {
      const { systemId } = req.params;
      const subjects = await storage.getSubjectsBySystem(systemId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Topic routes
  app.get('/api/topics/:subjectId/:levelId', async (req, res) => {
    try {
      const { subjectId, levelId } = req.params;
      const { termId } = req.query;
      const topics = await storage.getTopicsBySubjectAndLevel(subjectId, levelId, termId as string);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Quiz session routes
  app.post('/api/quiz/start', isAuthenticated, async (req: any, res) => {
    try {
      const { profileId, subjectId, quizType, topicId, term } = req.body;
      
      // Get profile to access level information
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Get subject information  
      const subjects = await storage.getSubjectsBySystem(profile.examinationSystemId);
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      // Get level information
      const levels = await storage.getLevelsBySystem(profile.examinationSystemId);
      const level = levels.find(l => l.id === profile.levelId);
      if (!level) {
        return res.status(404).json({ message: "Level not found" });
      }

      // Generate questions using AI
      let topicNames: string[] = [];
      if (quizType === 'topical' && topicId) {
        const topic = await db.select({ title: topics.title }).from(topics).where(eq(topics.id, topicId));
        if (topic[0]) topicNames = [topic[0].title];
      }

      console.log(`Generating questions for ${subject.name} ${level.title} (${quizType})`);
      
      const aiQuestions = await generateQuestions({
        subject: subject.name,
        level: level.title,
        topics: topicNames,
        term,
        quizType: quizType as 'random' | 'topical' | 'term',
        questionCount: 30
      });

      // Create quiz session
      const quizSession = await storage.createQuizSession({
        userId: req.user?.claims?.sub,
        profileId,
        subjectId,
        quizType,
        topicId: topicId || null,
        termId: term || null,
        totalQuestions: aiQuestions.length,
      });

      // Save generated questions to database
      const questionsToInsert = aiQuestions.map(q => ({
        topicId: topicId || null, // For random quizzes, topicId might be null
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }));

      const savedQuestions = await storage.createQuestions(questionsToInsert);

      res.json({
        sessionId: quizSession.id,
        questions: savedQuestions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
        })),
        totalQuestions: savedQuestions.length
      });

    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Batch answer submission for better performance
  app.post('/api/quiz/:sessionId/batch-answers', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers array is required" });
      }

      const results = [];
      for (const answerData of answers) {
        const { questionId, userAnswer, timeSpent } = answerData;
        
        // Get the question to check if answer is correct
        const questionResult = await db.select().from(questions).where(eq(questions.id, questionId));
        const question = questionResult[0];
        
        if (question) {
          const isCorrect = question.correctAnswer === userAnswer;
          
          // Save user answer
          await storage.createUserAnswer({
            quizSessionId: sessionId,
            questionId,
            userAnswer,
            isCorrect,
            timeSpent: timeSpent || 0,
          });

          results.push({
            questionId,
            isCorrect,
            correctAnswer: question.correctAnswer,
          });
        }
      }

      res.json({ results, message: "All answers submitted successfully" });
    } catch (error) {
      console.error("Error submitting batch answers:", error);
      res.status(500).json({ message: "Failed to submit answers" });
    }
  });

  // Single answer submission (kept for backward compatibility)
  app.post('/api/quiz/:sessionId/answer', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { questionId, userAnswer, timeSpent } = req.body;

      // Get the question to check if answer is correct
      const questionResult = await db.select().from(questions).where(eq(questions.id, questionId));
      const question = questionResult[0];
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const isCorrect = question.correctAnswer === userAnswer;

      // Save user answer
      const answer = await storage.createUserAnswer({
        quizSessionId: sessionId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
      });

      res.json({
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });

    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.post('/api/quiz/:sessionId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      // Get all answers for this quiz session
      const answers = await storage.getQuizAnswers(sessionId);
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalTime = answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      
      // Calculate sparks earned (base + accuracy bonus)
      const accuracy = correctAnswers / answers.length;
      const baseSparks = correctAnswers * 10;
      const bonusMultiplier = accuracy >= 0.8 ? 1.5 : accuracy >= 0.6 ? 1.2 : 1;
      const sparksEarned = Math.round(baseSparks * bonusMultiplier);

      // Update quiz session
      const updatedSession = await storage.updateQuizSession(sessionId, {
        correctAnswers,
        sparksEarned,
        timeSpent: totalTime,
        completed: true,
        completedAt: new Date(),
      });

      // Update profile sparks
      const profile = await storage.getProfile(updatedSession.profileId);
      if (profile) {
        await storage.updateProfile(profile.id, {
          sparks: (profile.sparks || 0) + sparksEarned,
          lastActivity: new Date(),
        });
      }

      res.json({
        correctAnswers,
        totalQuestions: answers.length,
        accuracy: Math.round(accuracy * 100),
        sparksEarned,
        timeSpent: totalTime,
      });

    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Get topics for a subject and level
  app.get('/api/subjects/:subjectId/topics/:levelId', async (req, res) => {
    try {
      const { subjectId, levelId } = req.params;
      const { term } = req.query;
      
      const topics = await storage.getTopicsBySubjectAndLevel(subjectId, levelId, term as string);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Start a quiz session - simplified to use existing quizzes
  app.post('/api/quiz/start', isAuthenticated, async (req: any, res) => {
    try {
      const { profileId, subjectId, quizType, topicId, term } = req.body;

      if (!profileId || !subjectId) {
        return res.status(400).json({ message: "Profile ID and Subject ID are required" });
      }

      // Get available quizzes for the subject
      const availableQuizzes = await storage.getQuizzesBySubject(subjectId);
      
      if (availableQuizzes.length === 0) {
        return res.status(404).json({ message: "No quizzes available for this subject" });
      }

      // Select a random quiz for now (can be enhanced with type filtering later)
      const selectedQuiz = availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];

      // Get quiz questions
      const quizWithQuestions = await storage.getQuizWithQuestions(selectedQuiz.id);

      if (!quizWithQuestions.questions || quizWithQuestions.questions.length === 0) {
        return res.status(404).json({ message: "No questions found in selected quiz" });
      }

      // Create quiz session
      const quizSession = await storage.createQuizSession({
        profileId,
        subjectId,
        quizType: 'random', // Using random for now
        totalQuestions: quizWithQuestions.questions.length,
      });

      // Transform questions to expected format
      const questions = quizWithQuestions.questions.map((q: any) => ({
        id: q.id,
        questionText: q.content,
        optionA: q.choices[0]?.content || 'Option A',
        optionB: q.choices[1]?.content || 'Option B', 
        optionC: q.choices[2]?.content || 'Option C',
        optionD: q.choices[3]?.content || 'Option D',
        correctAnswer: q.choices.find((c: any) => c.isCorrect)?.content.charAt(0) || 'A',
        explanation: q.explanation
      }));

      res.json({
        sessionId: quizSession.id,
        questions: questions,
        totalQuestions: questions.length,
      });
    } catch (error) {
      console.error("Error starting quiz:", error);
      res.status(500).json({ message: "Failed to start quiz: " + error.message });
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

      // Update profile sparks and streak (placeholder - implement if needed)
      // await storage.updateProfileSparks(profileId, sparksEarned);
      // const updatedProfile = await storage.updateProfileStreak(profileId);

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
        // currentStreak: updatedProfile?.streak || 0,
        // totalSparks: updatedProfile?.sparks || 0,
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

      // const progress = await storage.getProfileChallengeProgress(profileId, challenge.id);
      
      res.json({
        challenge,
        progress: { currentValue: 0, completed: false },
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
      // const stats = await storage.getProfileStats(profileId);
      res.json({ message: "Stats endpoint not implemented yet" });
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
      // Get KCSE system
      const systems = await storage.getExaminationSystems();
      const kcseSystem = systems.find(s => s.name === 'Kenya Certificate of Secondary Education');
      if (!kcseSystem) throw new Error('KCSE system not found');

      // Create KCSE subjects
      const mathSubject = await storage.createSubject({
        name: 'Mathematics',
        code: 'MATH',
        examinationSystemId: kcseSystem.id,
        icon: 'fas fa-calculator',
        color: 'from-spark-blue to-spark-turquoise',
      });

      const physicsSubject = await storage.createSubject({
        name: 'Physics',
        code: 'PHYS',
        examinationSystemId: kcseSystem.id,
        icon: 'fas fa-atom',
        color: 'from-spark-mint to-spark-turquoise',
      });

      // Get form 1 level and term 1
      const levels = await storage.getLevelsBySystem(kcseSystem.id);
      const form1Level = levels.find(l => l.title === 'Form 1');
      const terms = await storage.getTerms();
      const term1 = terms.find(t => t.title === 'Term 1');
      
      if (!form1Level || !term1) throw new Error('Level or term not found');

      // Create topics for Form 1 Mathematics
      const algebraTopic = await storage.createTopic({
        examinationSystemId: kcseSystem.id,
        subjectId: mathSubject.id,
        levelId: form1Level.id,
        termId: term1.id,
        title: 'Algebra I',
        description: 'Introduction to algebraic expressions and equations',
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
