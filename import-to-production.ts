import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import {
  examinationSystems,
  levels,
  subjects,
  topics,
  questions,
  quizzes,
} from "./shared/schema";
import { readFile } from "fs/promises";
import { sql } from "drizzle-orm";

// This script imports data to production database
// Run with: PRODUCTION_DATABASE_URL=<your-prod-url> npx tsx import-to-production.ts <export-file.json>

// Helper function to convert timestamp strings to Date objects
function convertTimestamps(obj: any): any {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  // Convert common timestamp field names
  const timestampFields = ['createdAt', 'updatedAt', 'completedAt', 'startedAt'];
  
  for (const field of timestampFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = new Date(result[field]);
    }
  }
  
  return result;
}

async function importData(filename: string, productionUrl: string) {
  console.log("\n📥 Importing Data to Production Database");
  console.log("=" + "=".repeat(60) + "\n");

  // Connect to production database
  console.log("🔌 Connecting to production database...");
  const pool = new Pool({ connectionString: productionUrl });
  const prodDb = drizzle(pool);
  console.log("✅ Connected!\n");

  try {
    // Read export file
    console.log(`📖 Reading ${filename}...`);
    const fileContent = await readFile(filename, "utf-8");
    const exportData = JSON.parse(fileContent);

    console.log(`📅 Export date: ${exportData.exportDate}`);
    console.log(`📊 Summary:`);
    Object.entries(exportData.summary).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
    console.log();

    // Import in correct order (respecting foreign keys)
    console.log("🚀 Starting import...\n");

    // 1. Examination Systems
    if (exportData.data.examinationSystems?.length > 0) {
      console.log("📝 Importing examination systems...");
      for (const item of exportData.data.examinationSystems) {
        const converted = convertTimestamps(item);
        await prodDb
          .insert(examinationSystems)
          .values(converted)
          .onConflictDoUpdate({
            target: examinationSystems.id,
            set: {
              name: converted.name,
              code: converted.code,
              description: converted.description,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.examinationSystems.length} examination systems\n`);
    }

    // 2. Levels
    if (exportData.data.levels?.length > 0) {
      console.log("📝 Importing levels...");
      for (const item of exportData.data.levels) {
        const converted = convertTimestamps(item);
        await prodDb
          .insert(levels)
          .values(converted)
          .onConflictDoUpdate({
            target: levels.id,
            set: {
              title: converted.title,
              code: converted.code,
              order: converted.order,
              systemId: converted.systemId,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.levels.length} levels\n`);
    }

    // 3. Subjects
    if (exportData.data.subjects?.length > 0) {
      console.log("📝 Importing subjects...");
      for (const item of exportData.data.subjects) {
        const converted = convertTimestamps(item);
        await prodDb
          .insert(subjects)
          .values(converted)
          .onConflictDoUpdate({
            target: subjects.id,
            set: {
              name: converted.name,
              code: converted.code,
              description: converted.description,
              icon: converted.icon,
              systemId: converted.systemId,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.subjects.length} subjects\n`);
    }

    // 4. Topics (with AI-generated content!)
    if (exportData.data.topics?.length > 0) {
      console.log("📝 Importing topics (including AI-generated notes)...");
      for (const item of exportData.data.topics) {
        const converted = convertTimestamps(item);
        await prodDb
          .insert(topics)
          .values(converted)
          .onConflictDoUpdate({
            target: topics.id,
            set: {
              title: converted.title,
              description: converted.description,
              order: converted.order,
              subjectId: converted.subjectId,
              levelId: converted.levelId,
              summaryContent: converted.summaryContent, // AI-generated notes!
              detailedContent: converted.detailedContent,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.topics.length} topics\n`);
    }

    // 5. Questions
    if (exportData.data.questions?.length > 0) {
      console.log("📝 Importing questions...");
      for (const item of exportData.data.questions) {
        const converted = convertTimestamps(item);
        await prodDb
          .insert(questions)
          .values(converted)
          .onConflictDoUpdate({
            target: questions.id,
            set: {
              questionText: converted.questionText,
              options: converted.options,
              correctAnswer: converted.correctAnswer,
              explanation: converted.explanation,
              difficulty: converted.difficulty,
              topicId: converted.topicId,
              subjectId: converted.subjectId,
              levelId: converted.levelId,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.questions.length} questions\n`);
    }

    // 6. Quizzes
    if (exportData.data.quizzes?.length > 0) {
      console.log("📝 Importing quizzes...");
      for (const item of exportData.data.quizzes) {
        const converted = convertTimestamps(item);
        await prodDb
          .insert(quizzes)
          .values(converted)
          .onConflictDoUpdate({
            target: quizzes.id,
            set: {
              userId: converted.userId,
              type: converted.type,
              subjectId: converted.subjectId,
              levelId: converted.levelId,
              topicId: converted.topicId,
              status: converted.status,
              totalQuestions: converted.totalQuestions,
              correctAnswers: converted.correctAnswers,
              score: converted.score,
              completedAt: converted.completedAt,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.quizzes.length} quizzes\n`);
    }

    console.log("=" + "=".repeat(60));
    console.log("✅ Import Complete!");
    console.log("=" + "=".repeat(60));
    console.log("\n🎉 All data successfully imported to production database!\n");
  } catch (error) {
    console.error("\n❌ Import failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Main execution
const args = process.argv.slice(2);
const filename = args[0];
const productionUrl = process.env.PRODUCTION_DATABASE_URL;

if (!filename) {
  console.error("❌ Error: Please provide export file as argument");
  console.log("\nUsage:");
  console.log(
    "  PRODUCTION_DATABASE_URL=<url> npx tsx import-to-production.ts database-export-123456.json\n"
  );
  process.exit(1);
}

if (!productionUrl) {
  console.error("❌ Error: PRODUCTION_DATABASE_URL environment variable not set");
  console.log("\nUsage:");
  console.log(
    "  PRODUCTION_DATABASE_URL=<url> npx tsx import-to-production.ts database-export-123456.json\n"
  );
  process.exit(1);
}

importData(filename, productionUrl)
  .then(() => {
    console.log("✨ Import script completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
