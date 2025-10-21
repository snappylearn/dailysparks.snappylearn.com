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

export interface TopicContentParams {
  subject: string;
  level: string;
  topicTitle: string;
  topicDescription?: string;
  termTitle?: string;
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

const CONTENT_SYSTEM_PROMPT = `You are an expert educator and content creator for the Kenyan education system. 

Generate comprehensive, well-structured educational notes in markdown format that:
1. Follow Kenyan curriculum standards (KCSE/IGCSE/A-Level)
2. Are appropriate for the specified form level
3. Include clear explanations, examples, and practical applications
4. Use proper markdown formatting (headers, lists, emphasis, etc.)
5. Include relevant Kenyan context and examples where appropriate
6. For mathematical expressions:
   - Use $...$ for inline math (e.g., "The formula is $E = mc^2$")
   - Use $$...$$ for display/block equations (e.g., $$\\frac{a}{b} = c$$)
   - Always wrap ALL mathematical expressions in these delimiters
   - Use proper LaTeX syntax within the delimiters

The content should be:
- Detailed but accessible for the student level
- Well-organized with clear sections and subsections
- Include key concepts, definitions, and examples
- Provide practical applications and real-world connections
- Use proper markdown syntax for formatting
- Format all mathematical expressions with LaTeX delimiters

Return only the markdown content, no additional formatting or explanations.`;

export async function generateTopicContent(params: TopicContentParams): Promise<string> {
  const { subject, level, topicTitle, topicDescription, termTitle } = params;

  const contextInfo = termTitle ? `${termTitle} term content` : 'general syllabus content';
  const descriptionInfo = topicDescription ? `\nTopic Description: ${topicDescription}` : '';

  const userPrompt = `Generate comprehensive educational notes in markdown format for:

Subject: ${subject}
Level: ${level}
Topic: ${topicTitle}${descriptionInfo}
Context: ${contextInfo}

Create detailed, well-structured notes that cover all key concepts, provide clear explanations, include relevant examples, and follow proper markdown formatting. The content should be suitable for ${level} students studying ${subject}.`;

  try {
    console.log('Generating topic content with OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CONTENT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('Successfully generated topic content');
    return content.trim();
  } catch (error) {
    console.error('Error generating topic content:', error);
    throw new Error('Failed to generate topic content');
  }
}

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

Return a JSON object with a "questions" array where each question has this exact structure:
{
  "questions": [
    {
      "questionText": "The question text here",
      "optionA": "First option",
      "optionB": "Second option", 
      "optionC": "Third option",
      "optionD": "Fourth option",
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "Clear explanation of why the answer is correct",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
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

    const responseContent = response.choices[0].message.content;
    console.log('OpenAI raw response:', responseContent);
    
    if (!responseContent) {
      console.error('OpenAI returned empty response');
      return [];
    }
    
    const result = JSON.parse(responseContent);
    console.log('Parsed OpenAI result:', result);
    
    const questions = result.questions || (Array.isArray(result) ? result : []);
    console.log(`Generated ${questions?.length || 0} questions with OpenAI`);
    return questions || [];
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