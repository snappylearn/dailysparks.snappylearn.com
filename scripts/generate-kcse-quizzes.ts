import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { quizzes, topics, levels, subjects, terms } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

// Initialize database connection
const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

// KCSE Level-Term mapping
const levelTermMapping = {
  'Form 1': [
    { id: '05408d45-33aa-421e-96b6-3ebfb59505b7', title: 'Form 1 Term 1' },
    { id: '60f822aa-54ac-4066-9b99-79f38a8345d6', title: 'Form 1 Term 2' },
    { id: '99f82484-1bee-4fae-b2a1-cd33c223874f', title: 'Form 1 Term 3' }
  ],
  'Form 2': [
    { id: '425c888f-db9f-436d-8982-808647749dce', title: 'Form 2 Term 1' },
    { id: '52b4a255-8747-4e3a-a4e9-392b63cca41b', title: 'Form 2 Term 2' },
    { id: 'c790f336-21ed-491f-ae27-218477d622c1', title: 'Form 2 Term 3' }
  ],
  'Form 3': [
    { id: '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', title: 'Form 3 Term 1' },
    { id: 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', title: 'Form 3 Term 2' },
    { id: 'e068a27b-c6c3-4662-9445-e4c8abd691d6', title: 'Form 3 Term 3' }
  ],
  'Form 4': [
    { id: '66e1c25d-5290-4979-b0f9-c505ce1e8859', title: 'Form 4 Term 1' },
    { id: '8c7661b2-05ab-4eb4-9507-205243c23618', title: 'Form 4 Term 2' },
    { id: '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', title: 'Form 4 Term 3' }
  ]
};

// KCSE subjects and levels
const kcseSubjects = [
  { id: '547ffc3a-b94d-4010-b5fd-b65773c12328', name: 'Mathematics' },
  { id: '75496eef-13e3-4071-8d37-6d6527ed07a5', name: 'English' },
  { id: 'fa73a32a-7027-4fbe-bcda-7c0431763b22', name: 'Kiswahili' },
  { id: 'e391687a-3d73-447f-8942-28b4d9f0f33c', name: 'Biology' },
  { id: 'eb371e93-ddef-421e-9ff9-05b36a454e12', name: 'Physics' },
  { id: '18c89482-24b4-400f-af4f-f9616ae884c2', name: 'Chemistry' },
  { id: '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', name: 'History & Government' },
  { id: 'e564e57b-97c1-47e2-8bf5-70c957ba2e4d', name: 'Geography' },
  { id: 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', name: 'Business Studies' },
  { id: '4f203b72-a622-40f0-8d13-b7cf5ef6c284', name: 'Agriculture' },
  { id: '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', name: 'Computer Studies' },
  { id: '2f0c1d75-3acb-481f-a9a4-5b6700cfc2cc', name: 'Art & Design' },
  { id: '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', name: 'Home Science' },
  { id: '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', name: 'Music' }
];

const kcseLevels = [
  { id: 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', title: 'Form 1' },
  { id: '60190057-a240-4429-b2a5-f770958d3865', title: 'Form 2' },
  { id: 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', title: 'Form 3' },
  { id: '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', title: 'Form 4' }
];

async function generateKCSEQuizzes() {
  console.log('Starting KCSE quiz generation...');
  
  let totalQuizzesCreated = 0;
  
  for (const level of kcseLevels) {
    console.log(`\n--- Processing ${level.title} ---`);
    
    const levelTerms = levelTermMapping[level.title as keyof typeof levelTermMapping];
    
    for (const subject of kcseSubjects) {
      console.log(`\nProcessing ${subject.name} for ${level.title}`);
      
      // Get topics for this subject and level
      const availableTopics = await db
        .select()
        .from(topics)
        .where(
          and(
            eq(topics.subjectId, subject.id),
            eq(topics.levelId, level.id)
          )
        );
      
      if (availableTopics.length === 0) {
        console.log(`  No topics found for ${subject.name} in ${level.title}, skipping...`);
        continue;
      }
      
      console.log(`  Found ${availableTopics.length} topics`);
      
      for (const term of levelTerms) {
        console.log(`    Creating quizzes for ${term.title}`);
        
        // Check if quizzes already exist for this combination
        const existingQuizzes = await db
          .select()
          .from(quizzes)
          .where(
            and(
              eq(quizzes.levelId, level.id),
              eq(quizzes.subjectId, subject.id),
              eq(quizzes.termId, term.id)
            )
          );
        
        const quizzesToCreate = Math.max(0, 3 - existingQuizzes.length);
        
        if (quizzesToCreate === 0) {
          console.log(`      Already has 3 quizzes, skipping...`);
          continue;
        }
        
        // Create 3 quizzes for this term
        for (let quizNum = existingQuizzes.length + 1; quizNum <= 3; quizNum++) {
          // Select random topics for this quiz (max 5 topics per quiz)
          const shuffledTopics = availableTopics.sort(() => Math.random() - 0.5);
          const selectedTopics = shuffledTopics.slice(0, Math.min(5, availableTopics.length));
          
          const quizData = {
            title: `${subject.name} ${term.title} Quiz ${quizNum}`,
            description: `Comprehensive ${subject.name} quiz covering key topics for ${term.title}. This quiz tests understanding of fundamental concepts and applications.`,
            instructions: `This quiz contains multiple-choice questions based on ${subject.name} curriculum for ${term.title}. Read each question carefully and select the best answer. You have unlimited time to complete this quiz.`,
            timeLimit: 45, // 45 minutes
            questionCount: Math.min(selectedTopics.length * 3, 15), // 3 questions per topic, max 15
            passingScore: 70,
            difficulty: 'medium',
            isPublished: true,
            levelId: level.id,
            subjectId: subject.id,
            termId: term.id,
            quizType: 'termly'
          };
          
          try {
            const [newQuiz] = await db.insert(quizzes).values(quizData).returning();
            console.log(`      ✓ Created: ${newQuiz.title}`);
            totalQuizzesCreated++;
          } catch (error) {
            console.error(`      ✗ Failed to create quiz ${quizNum}:`, error);
          }
        }
      }
    }
  }
  
  console.log(`\n🎉 Quiz generation complete! Created ${totalQuizzesCreated} new quizzes.`);
  console.log(`\nSummary:`);
  console.log(`- 4 KCSE levels (Form 1-4)`);
  console.log(`- ${kcseSubjects.length} subjects`);
  console.log(`- 3 terms per level`);
  console.log(`- 3 quizzes per term per subject`);
  console.log(`- Target: ${4 * kcseSubjects.length * 3 * 3} total quizzes`);
  console.log(`- Created: ${totalQuizzesCreated} new quizzes`);
}

// Run the generation
generateKCSEQuizzes().catch(console.error);