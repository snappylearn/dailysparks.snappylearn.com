/**
 * Quiz Engine Implementation for Daily Sparks LMS
 * Implements the enhanced quiz workflow with question snapshots and proper session management
 */

import { db } from "./db";
import { 
  quizTypes, 
  questionTypes, 
  quizzes, 
  quizQuestions, 
  quizQuestionChoices,
  enhancedQuizSessions,
  quizQuestionAnswers,
  questions,
  topics,
  profiles
} from "@shared/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import type { 
  QuizGenerationParams, 
  QuizQuestion, 
  QuizQuestionChoice, 
  QuizSessionSnapshot,
  QuizAnswer 
} from "@shared/quizWorkflow";
import { QUIZ_CONSTANTS } from "@shared/quizWorkflow";

export class QuizEngine {
  /**
   * Generate a new quiz based on parameters
   */
  static async generateQuiz(params: QuizGenerationParams, userId: string, profileId: string): Promise<string> {
    try {
      // 1. Get quiz type ID
      const [quizType] = await db
        .select()
        .from(quizTypes)
        .where(eq(quizTypes.code, params.quizType))
        .limit(1);

      if (!quizType) {
        throw new Error(`Quiz type ${params.quizType} not found`);
      }

      // 2. Create quiz record
      const [quiz] = await db
        .insert(quizzes)
        .values({
          title: `${params.quizType.charAt(0).toUpperCase() + params.quizType.slice(1)} Quiz`,
          examinationSystemId: params.examinationSystemId,
          levelId: params.levelId,
          subjectId: params.subjectId,
          quizTypeId: quizType.id,
          topicId: params.topicId,
          termId: params.termId,
          questionCount: params.questionCount || QUIZ_CONSTANTS.DEFAULT_QUESTION_COUNT,
          timeLimit: params.timeLimit || QUIZ_CONSTANTS.DEFAULT_TIME_LIMIT,
        })
        .returning();

      // 3. Generate questions based on quiz type
      let selectedQuestions: any[] = [];
      
      if (params.quizType === 'random') {
        selectedQuestions = await this.generateRandomQuestions(params);
      } else if (params.quizType === 'topical' && params.topicId) {
        selectedQuestions = await this.generateTopicalQuestions(params);
      } else if (params.quizType === 'termly' && params.termId) {
        selectedQuestions = await this.generateTermlyQuestions(params);
      }

      // 4. Get question type for MCQ
      const [mcqType] = await db
        .select()
        .from(questionTypes)
        .where(eq(questionTypes.code, 'mcq'))
        .limit(1);

      // 5. Create quiz questions and choices
      const createdQuestions: QuizQuestion[] = [];
      
      for (let i = 0; i < selectedQuestions.length; i++) {
        const question = selectedQuestions[i];
        
        // Create quiz question
        const [quizQuestion] = await db
          .insert(quizQuestions)
          .values({
            quizId: quiz.id,
            content: question.questionText,
            questionTypeId: mcqType?.id || '',
            marks: 1,
            difficulty: question.difficulty,
            explanation: question.explanation,
            orderIndex: i + 1,
          })
          .returning();

        // Create choices
        const choices: QuizQuestionChoice[] = [];
        const options = ['A', 'B', 'C', 'D'];
        
        for (let j = 0; j < options.length; j++) {
          const optionKey = `option${options[j]}` as keyof typeof question;
          const optionText = question[optionKey] as string;
          
          const [choice] = await db
            .insert(quizQuestionChoices)
            .values({
              quizQuestionId: quizQuestion.id,
              content: optionText,
              isCorrect: question.correctAnswer === options[j],
              orderIndex: j + 1,
            })
            .returning();

          choices.push({
            id: choice.id,
            content: choice.content,
            isCorrect: choice.isCorrect,
            orderIndex: choice.orderIndex,
          });
        }

        createdQuestions.push({
          id: quizQuestion.id,
          content: quizQuestion.content,
          questionType: 'mcq',
          marks: quizQuestion.marks,
          difficulty: quizQuestion.difficulty,
          explanation: quizQuestion.explanation,
          choices,
          orderIndex: quizQuestion.orderIndex,
        });
      }

      // 6. Create quiz session with snapshot
      const snapshot: QuizSessionSnapshot = {
        questions: createdQuestions,
        totalMarks: createdQuestions.reduce((sum, q) => sum + q.marks, 0),
        timeLimit: quiz.timeLimit,
        generatedAt: new Date().toISOString(),
      };

      const [session] = await db
        .insert(enhancedQuizSessions)
        .values({
          quizId: quiz.id,
          userId,
          profileId,
          examinationSystemId: params.examinationSystemId,
          levelId: params.levelId,
          subjectId: params.subjectId,
          quizQuestions: snapshot,
          totalQuestions: createdQuestions.length,
          totalMarks: snapshot.totalMarks,
        })
        .returning();

      return session.id;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Generate random questions from subject/level
   */
  private static async generateRandomQuestions(params: QuizGenerationParams) {
    const questionCount = params.questionCount || QUIZ_CONSTANTS.DEFAULT_QUESTION_COUNT;
    
    // Get questions from the subject across all topics
    const availableQuestions = await db
      .select()
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(
        and(
          eq(topics.subjectId, params.subjectId),
          eq(topics.levelId, params.levelId)
        )
      )
      .limit(questionCount * 2); // Get extra to allow for selection

    // Randomly select questions
    const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, questionCount).map(item => item.questions);
  }

  /**
   * Generate topical questions
   */
  private static async generateTopicalQuestions(params: QuizGenerationParams) {
    const questionCount = params.questionCount || QUIZ_CONSTANTS.DEFAULT_QUESTION_COUNT;
    
    const topicQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.topicId, params.topicId!))
      .limit(questionCount);

    return topicQuestions;
  }

  /**
   * Generate termly questions
   */
  private static async generateTermlyQuestions(params: QuizGenerationParams) {
    const questionCount = params.questionCount || QUIZ_CONSTANTS.DEFAULT_QUESTION_COUNT;
    
    // Get questions from all topics in the term
    const termQuestions = await db
      .select()
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(
        and(
          eq(topics.subjectId, params.subjectId),
          eq(topics.levelId, params.levelId),
          eq(topics.termId, params.termId!)
        )
      )
      .limit(questionCount * 2);

    const shuffled = termQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, questionCount).map(item => item.questions);
  }

  /**
   * Submit an answer for a quiz question
   */
  static async submitAnswer(sessionId: string, answer: QuizAnswer): Promise<boolean> {
    try {
      // Get session and snapshot
      const [session] = await db
        .select()
        .from(enhancedQuizSessions)
        .where(eq(enhancedQuizSessions.id, sessionId))
        .limit(1);

      if (!session) {
        throw new Error('Quiz session not found');
      }

      const snapshot = session.quizQuestions as QuizSessionSnapshot;
      const question = snapshot.questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        throw new Error('Question not found in session');
      }

      // Check if answer is correct
      let isCorrect = false;
      let marks = 0;
      let sparks = 0;

      if (question.questionType === 'mcq' && answer.choiceId) {
        const correctChoice = question.choices?.find(c => c.isCorrect);
        isCorrect = answer.choiceId === correctChoice?.id;
      }

      if (isCorrect) {
        marks = question.marks;
        sparks = this.calculateSparks(question.difficulty);
      }

      // Store answer
      await db.insert(quizQuestionAnswers).values({
        quizSessionId: sessionId,
        quizQuestionId: answer.questionId,
        quizQuestionChoiceId: answer.choiceId,
        answer: answer.answer,
        isCorrect,
        marks,
        sparks,
        timeSpent: answer.timeSpent,
      });

      return isCorrect;
    } catch (error) {
      console.error('Answer submission error:', error);
      throw new Error(`Failed to submit answer: ${error.message}`);
    }
  }

  /**
   * Complete quiz session and calculate final results
   */
  static async completeQuizSession(sessionId: string): Promise<any> {
    try {
      // Get all answers for the session
      const answers = await db
        .select()
        .from(quizQuestionAnswers)
        .where(eq(quizQuestionAnswers.quizSessionId, sessionId));

      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const totalMarks = answers.reduce((sum, a) => sum + (a.marks || 0), 0);
      const totalSparks = answers.reduce((sum, a) => sum + (a.sparks || 0), 0);
      const accuracyPercentage = answers.length > 0 
        ? Math.round((correctAnswers / answers.length) * 100) 
        : 0;

      // Add completion bonus
      let finalSparks = totalSparks + QUIZ_CONSTANTS.SPARKS.COMPLETION_BONUS;
      if (accuracyPercentage === 100) {
        finalSparks += QUIZ_CONSTANTS.SPARKS.PERFECT_SCORE_BONUS;
      }

      // Update session
      const [updatedSession] = await db
        .update(enhancedQuizSessions)
        .set({
          endTime: new Date(),
          correctAnswers,
          marksObtained: totalMarks,
          sparksEarned: finalSparks,
          accuracyPercentage,
          completed: true,
        })
        .where(eq(enhancedQuizSessions.id, sessionId))
        .returning();

      // Update profile sparks
      await db
        .update(profiles)
        .set({
          sparks: sql`${profiles.sparks} + ${finalSparks}`,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, updatedSession.profileId));

      return {
        sessionId,
        correctAnswers,
        totalQuestions: answers.length,
        accuracyPercentage,
        marksObtained: totalMarks,
        totalMarks: updatedSession.totalMarks,
        sparksEarned: finalSparks,
        canRetake: updatedSession.canRetake,
      };
    } catch (error) {
      console.error('Quiz completion error:', error);
      throw new Error(`Failed to complete quiz: ${error.message}`);
    }
  }

  /**
   * Calculate sparks based on difficulty
   */
  private static calculateSparks(difficulty: string): number {
    switch (difficulty.toLowerCase()) {
      case 'easy': return QUIZ_CONSTANTS.SPARKS.EASY_QUESTION;
      case 'hard': return QUIZ_CONSTANTS.SPARKS.HARD_QUESTION;
      default: return QUIZ_CONSTANTS.SPARKS.MEDIUM_QUESTION;
    }
  }

  /**
   * Get quiz session details
   */
  static async getQuizSession(sessionId: string): Promise<any> {
    const [session] = await db
      .select()
      .from(enhancedQuizSessions)
      .where(eq(enhancedQuizSessions.id, sessionId))
      .limit(1);

    if (!session) {
      throw new Error('Quiz session not found');
    }

    return {
      id: session.id,
      quizId: session.quizId,
      questions: (session.quizQuestions as QuizSessionSnapshot).questions,
      timeLimit: (session.quizQuestions as QuizSessionSnapshot).timeLimit,
      startTime: session.startTime,
      endTime: session.endTime,
      completed: session.completed,
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      accuracyPercentage: session.accuracyPercentage,
      sparksEarned: session.sparksEarned,
    };
  }
}