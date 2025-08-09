import { db } from "../server/db";
import { quizzes, examinationSystems, levels, subjects } from "../shared/schema";
import { eq } from "drizzle-orm";

// Sample quiz data for testing
const sampleQuizzes = [
  {
    title: "Physics Fundamentals",
    description: "Basic physics concepts and principles",
    subject: "Physics",
    questions: [
      {
        id: "q1",
        content: "What is the SI unit of force?",
        choices: [
          { content: "Newton", isCorrect: true, orderIndex: 1 },
          { content: "Joule", isCorrect: false, orderIndex: 2 },
          { content: "Watt", isCorrect: false, orderIndex: 3 },
          { content: "Pascal", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "The SI unit of force is the Newton (N), named after Sir Isaac Newton."
      },
      {
        id: "q2", 
        content: "What is the acceleration due to gravity on Earth?",
        choices: [
          { content: "9.8 m/s²", isCorrect: true, orderIndex: 1 },
          { content: "10.8 m/s²", isCorrect: false, orderIndex: 2 },
          { content: "8.8 m/s²", isCorrect: false, orderIndex: 3 },
          { content: "11.8 m/s²", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "The standard acceleration due to gravity on Earth is approximately 9.8 m/s²."
      },
      {
        id: "q3",
        content: "What type of energy does a moving object possess?",
        choices: [
          { content: "Kinetic energy", isCorrect: true, orderIndex: 1 },
          { content: "Potential energy", isCorrect: false, orderIndex: 2 },
          { content: "Chemical energy", isCorrect: false, orderIndex: 3 },
          { content: "Nuclear energy", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "A moving object possesses kinetic energy, which depends on its mass and velocity."
      }
    ]
  },
  {
    title: "Mathematics Basics",
    description: "Fundamental mathematical concepts", 
    subject: "Mathematics",
    questions: [
      {
        id: "q4",
        content: "What is the value of π (pi) to 2 decimal places?",
        choices: [
          { content: "3.14", isCorrect: true, orderIndex: 1 },
          { content: "3.15", isCorrect: false, orderIndex: 2 },
          { content: "3.13", isCorrect: false, orderIndex: 3 },
          { content: "3.16", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "Pi (π) is approximately 3.14159, which rounds to 3.14 to 2 decimal places."
      },
      {
        id: "q5",
        content: "What is 2³?",
        choices: [
          { content: "8", isCorrect: true, orderIndex: 1 },
          { content: "6", isCorrect: false, orderIndex: 2 },
          { content: "9", isCorrect: false, orderIndex: 3 },
          { content: "4", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "2³ = 2 × 2 × 2 = 8"
      }
    ]
  },
  {
    title: "Chemistry Introduction",
    description: "Basic chemistry concepts",
    subject: "Chemistry", 
    questions: [
      {
        id: "q6",
        content: "What is the chemical symbol for water?",
        choices: [
          { content: "H₂O", isCorrect: true, orderIndex: 1 },
          { content: "CO₂", isCorrect: false, orderIndex: 2 },
          { content: "NaCl", isCorrect: false, orderIndex: 3 },
          { content: "O₂", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "Water is composed of two hydrogen atoms and one oxygen atom, hence H₂O."
      }
    ]
  },
  {
    title: "Biology Fundamentals", 
    description: "Basic biological concepts",
    subject: "Biology",
    questions: [
      {
        id: "q7",
        content: "What is the powerhouse of the cell?",
        choices: [
          { content: "Mitochondria", isCorrect: true, orderIndex: 1 },
          { content: "Nucleus", isCorrect: false, orderIndex: 2 },
          { content: "Ribosome", isCorrect: false, orderIndex: 3 },
          { content: "Golgi apparatus", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "Mitochondria are called the powerhouse of the cell because they produce ATP energy."
      }
    ]
  },
  {
    title: "English Language",
    description: "English grammar and comprehension",
    subject: "English",
    questions: [
      {
        id: "q8",
        content: "Which is the correct plural of 'child'?",
        choices: [
          { content: "Children", isCorrect: true, orderIndex: 1 },
          { content: "Childs", isCorrect: false, orderIndex: 2 },
          { content: "Childes", isCorrect: false, orderIndex: 3 },
          { content: "Childies", isCorrect: false, orderIndex: 4 }
        ],
        explanation: "The plural of 'child' is 'children', which is an irregular plural form."
      }
    ]
  }
];

async function seedTestQuizzes() {
  try {
    console.log("Starting to seed test quizzes...");

    // Get examination systems, levels, and subjects
    const systems = await db.select().from(examinationSystems);
    const allLevels = await db.select().from(levels);  
    const allSubjects = await db.select().from(subjects);

    console.log("Found:", systems.length, "systems,", allLevels.length, "levels,", allSubjects.length, "subjects");

    if (systems.length === 0 || allLevels.length === 0 || allSubjects.length === 0) {
      console.log("No systems, levels or subjects found. Cannot seed quizzes.");
      return;
    }

    // Create test admin user ID (you'll need to replace this with actual admin user)
    const adminUserId = "test-admin-user";

    // For each quiz template, create quizzes for all system/level/subject combinations
    for (const quizTemplate of sampleQuizzes) {
      const matchingSubjects = allSubjects.filter(s => 
        s.name.toLowerCase().includes(quizTemplate.subject.toLowerCase()) ||
        quizTemplate.subject.toLowerCase().includes(s.name.toLowerCase())
      );

      if (matchingSubjects.length === 0) {
        console.log(`No matching subjects found for ${quizTemplate.subject}`);
        continue;
      }

      for (const system of systems) {
        const systemLevels = allLevels.filter(l => l.examinationSystemId === system.id);
        
        for (const level of systemLevels) {
          for (const subject of matchingSubjects) {
            const quizData = {
              title: `${quizTemplate.title} - ${system.name} ${level.title}`,
              description: quizTemplate.description,
              examinationSystemId: system.id,
              levelId: level.id,
              subjectId: subject.id,
              quizType: 'random',
              questions: quizTemplate.questions,
              totalQuestions: quizTemplate.questions.length,
              timeLimit: 30, // 30 minutes
              difficulty: 'medium',
              isActive: true,
              createdBy: adminUserId
            };

            try {
              const [newQuiz] = await db.insert(quizzes).values(quizData).returning();
              console.log(`Created quiz: ${newQuiz.title}`);
            } catch (error) {
              console.error(`Failed to create quiz for ${subject.name}:`, error);
            }
          }
        }
      }
    }

    console.log("Finished seeding test quizzes!");

  } catch (error) {
    console.error("Error seeding test quizzes:", error);
  }
}

// Run the seed function
seedTestQuizzes().then(() => {
  console.log("Seeding complete");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});