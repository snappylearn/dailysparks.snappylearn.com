import OpenAI from "openai";
import { db } from "./db";
import { 
  quizTypes, 
  quizzes, 
  quizSessions,
  quizQuestionAnswers,
  examinationSystems,
  levels,
  subjects,
  terms,
  topics
} from "@shared/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface QuizGenerationParams {
  examinationSystemId: string;
  levelId: string;
  subjectId: string;
  quizType: string;
  topicId?: string;
  termId?: string;
  questionCount: number;
  timeLimit: number;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export class LLMQuizEngine {
  
  /**
   * Generate quiz for admin use (saves to quiz bank)
   */
  static async generateQuizForAdmin(params: QuizGenerationParams, userId: string): Promise<string> {
    try {
      console.log('Starting admin LLM quiz generation with params:', params);
      
      // 1. Fetch contextual data for LLM prompt
      const contextData = await this.fetchContextData(params);
      
      // 2. Generate questions using LLM with your exact prompt structure
      const generatedQuestions = await this.generateQuestionsWithLLM(contextData, params);
      
      // 3. Create quiz template (NOT session) for admin
      const quizId = await this.createQuizTemplate(userId, generatedQuestions, params);
      
      console.log('Admin LLM quiz template generation completed. Quiz ID:', quizId);
      return quizId;
      
    } catch (error: any) {
      console.error('Admin LLM quiz generation error:', error);
      throw new Error(`Failed to generate admin quiz: ${error.message}`);
    }
  }

  /**
   * Generate quiz using the exact LLM prompt structure provided by user
   */
  static async generateQuiz(params: QuizGenerationParams, userId: string, profileId: string): Promise<string> {
    try {
      console.log('Starting LLM quiz generation with params:', params);
      
      // 1. Fetch contextual data for LLM prompt
      const contextData = await this.fetchContextData(params);
      
      // 2. Generate questions using LLM with your exact prompt structure
      const generatedQuestions = await this.generateQuestionsWithLLM(contextData, params);
      
      // 3. Create quiz session directly with JSONB snapshot (simpler approach)
      const sessionId = await this.createQuizSession(userId, profileId, generatedQuestions, params);
      
      console.log('LLM quiz generation completed. Session ID:', sessionId);
      return sessionId;
      
    } catch (error: any) {
      console.error('LLM quiz generation error:', error);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Fetch contextual data from database for LLM prompt
   */
  private static async fetchContextData(params: QuizGenerationParams) {
    const [examinationSystem] = await db
      .select()
      .from(examinationSystems)
      .where(eq(examinationSystems.id, params.examinationSystemId));

    const [level] = await db
      .select()
      .from(levels)
      .where(eq(levels.id, params.levelId));

    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, params.subjectId));

    let term = null;
    if (params.termId) {
      const termResult = await db
        .select()
        .from(terms)
        .where(eq(terms.id, params.termId));
      term = termResult[0] || null;
    }

    let topic = null;
    if (params.topicId) {
      [topic] = await db
        .select()
        .from(topics)
        .where(eq(topics.id, params.topicId));
    }

    return {
      examinationSystem,
      level,
      subject,
      term,
      topic
    };
  }

  /**
   * Generate questions using your exact LLM prompt structure
   */
  private static async generateQuestionsWithLLM(contextData: any, params: QuizGenerationParams): Promise<GeneratedQuestion[]> {
    // Build dynamic prompt with variable substitution as per your instructions
    let prompt = `You are an expert educational content creator tasked with generating multiple-choice quizzes for students.

## Objective:
Generate quizzes based on the given examination system, level, subject, term, and topic. 
The quiz should be tailored to the selected educational context, but adapt gracefully when some details are missing.

## Dynamic Variables (fetched from database):
- examination_system: ${contextData.examinationSystem?.title || 'Not specified'}
- level: ${contextData.level?.title || 'Not specified'}`;

    // Add optional variables only if they exist (as per your instructions)
    if (contextData.subject) {
      prompt += `\n- subject: ${contextData.subject.name}`;
    }
    if (contextData.term) {
      prompt += `\n- term: ${contextData.term.title}`;
    }
    if (contextData.topic) {
      prompt += `\n- topic: ${contextData.topic.title}`;
    }

    prompt += `

Note: Only include variables that are provided. If a variable is missing (null), do not assume or make it up — simply generate appropriate content within the scope of the provided variables.

## Quiz Types:
1. **Random Quiz** → Use examination_system + level (and subject if given) to create a broad quiz.
2. **Term Quiz** → Use examination_system + level + subject + term.
3. **Topical Quiz** → Use examination_system + level + subject + topic.

## Output Requirements:
- CRITICAL: Respond with ONLY valid JSON, no markdown formatting, no code blocks, no additional text.
- Format the response as a JSON object with a "questions" array.
- The JSON structure must be: {"questions": [...array of question objects...]}
- Each question object must have exactly:
  - "question": string — the question text.
  - "options": array of 4 strings — the possible answers.
  - "correct_answer": string — exactly matches one of the options.
  - "explanation": string — clear reasoning for why the correct answer is correct.

## Rules:
- All questions must be relevant to the context provided by the variables.
- For MCQs, include exactly 1 correct answer and 3 plausible distractors.
- Avoid ambiguous wording.
- Maintain consistent difficulty suitable for the specified level.
- If no subject/term/topic is provided, generate questions covering varied subjects available in the given examination system & level.
- Never reference the existence of variables in the question text itself (e.g., don't say "Since this is a term quiz...").

Generate exactly ${params.questionCount} questions following this format.`;

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model as per blueprint
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user", 
          content: `Generate exactly ${params.questionCount} multiple choice questions. Respond with ONLY valid JSON in this exact format: {"questions": [...]} with no additional text or formatting.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI raw response:', content);

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      // Parse response - expect {"questions": [...]} format
      const parsed = JSON.parse(content);
      let questions: GeneratedQuestion[];
      
      if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (Array.isArray(parsed)) {
        questions = parsed;
      } else {
        console.error('Unexpected LLM response structure:', parsed);
        throw new Error('Invalid response format from LLM - expected {"questions": [...]} structure');
      }

      // Validate questions structure
      questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correct_answer || !q.explanation) {
          throw new Error(`Question ${index + 1} missing required fields`);
        }
        if (q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
        if (!q.options.includes(q.correct_answer)) {
          throw new Error(`Question ${index + 1} correct_answer not found in options`);
        }
      });

      console.log(`Generated ${questions.length} validated questions`);
      return questions;

    } catch (parseError: any) {
      console.error('Error parsing LLM response:', parseError);
      throw new Error(`Failed to parse LLM response: ${parseError.message}`);
    }
  }



  /**
   * Create quiz template for admin (stored in quizzes table, NOT quiz_sessions)
   */
  private static async createQuizTemplate(
    adminUserId: string, 
    generatedQuestions: GeneratedQuestion[],
    params: QuizGenerationParams
  ): Promise<string> {
    // Transform generated questions to our format
    const questionsSnapshot = generatedQuestions.map((q, index) => ({
      id: `q_${index + 1}`,
      content: q.question,
      questionType: 'mcq',
      marks: 1,
      difficulty: 'medium',
      explanation: q.explanation,
      orderIndex: index + 1,
      choices: q.options.map((option, choiceIndex) => ({
        id: `q_${index + 1}_c_${choiceIndex + 1}`,
        content: option,
        isCorrect: option === q.correct_answer,
        orderIndex: choiceIndex + 1
      }))
    }));

    // Generate quiz title based on context
    let title = `${params.quizType.charAt(0).toUpperCase() + params.quizType.slice(1)} Quiz`;
    if (params.topicId) {
      const [topic] = await db.select().from(topics).where(eq(topics.id, params.topicId));
      title = `${topic?.title || 'Topic'} Quiz`;
    }

    const [quiz] = await db
      .insert(quizzes)
      .values({
        title,
        description: `AI-generated ${params.quizType} quiz with ${params.questionCount} questions`,
        examinationSystemId: params.examinationSystemId,
        levelId: params.levelId,
        subjectId: params.subjectId,
        quizType: params.quizType,
        topicId: params.topicId || null,
        termId: params.termId || null,
        questions: questionsSnapshot, // JSONB snapshot
        totalQuestions: params.questionCount,
        timeLimit: params.timeLimit,
        createdBy: adminUserId
      })
      .returning();

    return quiz.id;
  }

  /**
   * Create quiz session with JSONB question snapshot (for students taking quizzes)
   */
  private static async createQuizSession(
    userId: string, 
    profileId: string, 
    generatedQuestions: GeneratedQuestion[],
    params: QuizGenerationParams
  ): Promise<string> {
    
    // Transform generated questions to our format with choice structure
    const questionsSnapshot = generatedQuestions.map((q, index) => ({
      id: `q_${index + 1}`,
      content: q.question,
      questionType: 'mcq',
      marks: 1,
      difficulty: 'medium',
      explanation: q.explanation,
      orderIndex: index + 1,
      choices: q.options.map((option, choiceIndex) => ({
        id: `q_${index + 1}_c_${choiceIndex + 1}`,
        content: option,
        isCorrect: option === q.correct_answer,
        orderIndex: choiceIndex + 1
      }))
    }));

    const [session] = await db
      .insert(quizSessions)
      .values({
        userId,
        profileId,
        subjectId: params.subjectId,
        quizType: params.quizType,
        topicId: params.topicId,
        termId: params.termId,
        quizQuestions: questionsSnapshot, // JSONB snapshot
        totalQuestions: params.questionCount,
        correctAnswers: 0,
        sparksEarned: 0,
        completed: false
      })
      .returning();

    return session.id;
  }

  /**
   * Get quiz session with questions
   */
  static async getQuizSession(sessionId: string) {
    const [session] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, sessionId));

    if (!session) {
      throw new Error('Quiz session not found');
    }

    return {
      id: session.id,
      questions: session.quizQuestions,
      totalQuestions: session.totalQuestions,
      completed: session.completed,
      startTime: session.startedAt,
      timeLimit: 30 // From quiz record
    };
  }

  /**
   * Submit answer for a question
   */
  static async submitAnswer(sessionId: string, questionId: string, choiceId: string, answer: string, timeSpent: number) {
    // Get session to check answer against snapshot
    const [session] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, sessionId));

    if (!session) {
      throw new Error('Quiz session not found');
    }

    // Find question in snapshot
    const questions = session.quizQuestions as any[];
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      throw new Error('Question not found');
    }

    // Check if answer is correct
    const selectedChoice = question.choices.find((c: any) => c.content === answer);
    const isCorrect = selectedChoice?.isCorrect || false;
    
    // Calculate sparks
    const sparks = this.calculateSparks(question.difficulty, isCorrect);

    // For now, store answer info in a simple way (we can create answers table later if needed)
    // Update session progress
    const currentCorrect = session.correctAnswers || 0;
    const currentSparks = session.sparksEarned || 0;
    
    if (isCorrect) {
      await db
        .update(quizSessions)
        .set({
          correctAnswers: currentCorrect + 1,
          sparksEarned: currentSparks + sparks
        })
        .where(eq(quizSessions.id, sessionId));
    }

    return { isCorrect, sparks };
  }

  /**
   * Complete quiz and calculate final results
   */
  static async completeQuiz(sessionId: string) {
    // Get session data
    const [session] = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, sessionId));

    if (!session) {
      throw new Error('Quiz session not found');
    }

    const correctAnswers = session.correctAnswers || 0;
    const totalQuestions = session.totalQuestions || 0;
    const currentSparks = session.sparksEarned || 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Add completion bonus
    const completionBonus = 20;
    const perfectScoreBonus = accuracy === 100 ? 50 : 0;
    const finalSparks = currentSparks + completionBonus + perfectScoreBonus;

    // Update session
    await db
      .update(quizSessions)
      .set({
        sparksEarned: finalSparks,
        completed: true,
        completedAt: new Date()
      })
      .where(eq(quizSessions.id, sessionId));

    return {
      sessionId,
      totalQuestions,
      correctAnswers,
      sparksEarned: finalSparks,
      accuracy,
      completed: true
    };
  }

  /**
   * Generate appropriate quiz title
   */
  private static generateQuizTitle(quizType: string, contextData: any): string {
    const subject = contextData.subject?.title || 'Mixed Subjects';
    const level = contextData.level?.title || 'General';
    
    switch (quizType) {
      case 'random':
        return `${subject} Random Quiz - ${level}`;
      case 'topical':
        const topic = contextData.topic?.title || 'General Topics';
        return `${subject} - ${topic} (${level})`;
      case 'term':
        const term = contextData.term?.title || 'General Term';
        return `${subject} - ${term} Quiz (${level})`;
      default:
        return `${subject} Quiz - ${level}`;
    }
  }

  /**
   * Calculate sparks based on difficulty and correctness
   */
  private static calculateSparks(difficulty: string, isCorrect: boolean): number {
    if (!isCorrect) return 0;
    
    const difficultyMultipliers = {
      easy: 5,
      medium: 10,
      hard: 15
    };
    
    return difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 10;
  }

  /**
   * Create admin quiz session for review and editing (DEPRECATED - use createQuizTemplate)
   */
  private static async createAdminQuizSession(
    userId: string,
    generatedQuestions: GeneratedQuestion[],
    params: QuizGenerationParams
  ): Promise<string> {
    
    // Transform generated questions to our format with choice structure
    const questionsSnapshot = generatedQuestions.map((q, index) => ({
      id: `q_${index + 1}`,
      content: q.question,
      questionType: 'mcq',
      marks: 1,
      difficulty: 'medium',
      explanation: q.explanation,
      orderIndex: index + 1,
      choices: q.options.map((option, choiceIndex) => ({
        id: `q_${index + 1}_c_${choiceIndex + 1}`,
        content: option,
        isCorrect: option === q.correct_answer,
        orderIndex: choiceIndex + 1
      }))
    }));

    // For admin-generated quizzes, we need a profileId - use the user's first profile
    const profiles = await import('./storage').then(({ storage }) => storage.getUserProfiles(userId));
    const profileId = profiles[0]?.id;
    
    if (!profileId) {
      throw new Error('No profile found for admin user');
    }

    const [session] = await db
      .insert(quizSessions)
      .values({
        userId,
        profileId,
        subjectId: params.subjectId,
        quizType: params.quizType,
        topicId: params.topicId,
        termId: params.termId,
        quizQuestions: questionsSnapshot, // JSONB snapshot
        totalQuestions: params.questionCount,
        correctAnswers: 0,
        sparksEarned: 0,
        completed: false
      })
      .returning();

    return session.id;
  }
}