import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// Initialize AI clients
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const gemini = process.env.GEMINI_API_KEY ? new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
}) : null;

export interface QuizQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionGenerationParams {
  subject: string;
  level: string;
  topics?: string[];
  term?: string;
  quizType: 'random' | 'topical' | 'term';
  questionCount: number;
}

const SYSTEM_PROMPT = `You are an expert question generator for Kenyan KCSE examination system. 

Generate high-quality multiple choice questions that:
1. Follow KCSE examination standards and format
2. Are appropriate for the specified form level (Form 1-4)
3. Test understanding, application, and critical thinking
4. Have exactly one correct answer and three plausible distractors
5. Include clear, educational explanations

Guidelines:
- Questions should be clear and unambiguous
- Options should be of similar length and complexity
- Explanations should teach the concept, not just state the answer
- Difficulty should match the form level (Form 1 = easier, Form 4 = harder)
- Use Kenyan context and examples where appropriate

Return valid JSON array with the exact structure specified.`;

export async function generateQuestions(params: QuestionGenerationParams): Promise<QuizQuestion[]> {
  const {
    subject,
    level,
    topics = [],
    term,
    quizType,
    questionCount
  } = params;

  // Build dynamic prompt based on quiz type
  let topicContext = '';
  if (quizType === 'topical' && topics.length > 0) {
    topicContext = `Focus on these specific topics: ${topics.join(', ')}`;
  } else if (quizType === 'term' && term) {
    topicContext = `Focus on ${term} syllabus content`;
  } else {
    topicContext = `Cover various topics from the ${subject} syllabus`;
  }

  const userPrompt = `Generate ${questionCount} multiple choice questions for:
- Subject: ${subject}
- Level: ${level}
- Context: ${topicContext}

Return a JSON array where each question has this exact structure:
{
  "questionText": "The question text here",
  "optionA": "First option",
  "optionB": "Second option", 
  "optionC": "Third option",
  "optionD": "Fourth option",
  "correctAnswer": "A" | "B" | "C" | "D",
  "explanation": "Clear explanation of why the answer is correct",
  "difficulty": "easy" | "medium" | "hard"
}`;

  // Try Gemini first, fallback to OpenAI
  try {
    if (gemini) {
      console.log('Attempting question generation with Gemini...');
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionText: { type: 'string' },
                optionA: { type: 'string' },
                optionB: { type: 'string' },
                optionC: { type: 'string' },
                optionD: { type: 'string' },
                correctAnswer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                explanation: { type: 'string' },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
              },
              required: ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation', 'difficulty']
            }
          }
        },
        contents: userPrompt
      });

      const questions = JSON.parse(response.text || '[]');
      console.log(`Generated ${questions.length} questions with Gemini`);
      return questions;
    }
  } catch (error) {
    console.warn('Gemini failed, falling back to OpenAI:', error);
  }

  // Fallback to OpenAI
  try {
    console.log('Generating questions with OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
    const questions = result.questions || result;
    console.log(`Generated ${questions.length} questions with OpenAI`);
    return questions;
  } catch (error) {
    console.error('Both AI services failed:', error);
    throw new Error('Failed to generate questions with both AI services');
  }
}

export async function generateSingleQuestion(
  subject: string,
  level: string,
  topic: string
): Promise<QuizQuestion> {
  const questions = await generateQuestions({
    subject,
    level,
    topics: [topic],
    quizType: 'topical',
    questionCount: 1
  });

  if (questions.length === 0) {
    throw new Error('Failed to generate question');
  }

  return questions[0];
}