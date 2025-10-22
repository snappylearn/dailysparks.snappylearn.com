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
        await prodDb
          .insert(examinationSystems)
          .values(item)
          .onConflictDoUpdate({
            target: examinationSystems.id,
            set: {
              name: item.name,
              code: item.code,
              description: item.description,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.examinationSystems.length} examination systems\n`);
    }

    // 2. Levels
    if (exportData.data.levels?.length > 0) {
      console.log("📝 Importing levels...");
      for (const item of exportData.data.levels) {
        await prodDb
          .insert(levels)
          .values(item)
          .onConflictDoUpdate({
            target: levels.id,
            set: {
              title: item.title,
              code: item.code,
              order: item.order,
              systemId: item.systemId,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.levels.length} levels\n`);
    }

    // 3. Subjects
    if (exportData.data.subjects?.length > 0) {
      console.log("📝 Importing subjects...");
      for (const item of exportData.data.subjects) {
        await prodDb
          .insert(subjects)
          .values(item)
          .onConflictDoUpdate({
            target: subjects.id,
            set: {
              name: item.name,
              code: item.code,
              description: item.description,
              icon: item.icon,
              systemId: item.systemId,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.subjects.length} subjects\n`);
    }

    // 4. Topics (with AI-generated content!)
    if (exportData.data.topics?.length > 0) {
      console.log("📝 Importing topics (including AI-generated notes)...");
      for (const item of exportData.data.topics) {
        await prodDb
          .insert(topics)
          .values(item)
          .onConflictDoUpdate({
            target: topics.id,
            set: {
              title: item.title,
              description: item.description,
              order: item.order,
              subjectId: item.subjectId,
              levelId: item.levelId,
              summaryContent: item.summaryContent, // AI-generated notes!
              detailedContent: item.detailedContent,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.topics.length} topics\n`);
    }

    // 5. Questions
    if (exportData.data.questions?.length > 0) {
      console.log("📝 Importing questions...");
      for (const item of exportData.data.questions) {
        await prodDb
          .insert(questions)
          .values(item)
          .onConflictDoUpdate({
            target: questions.id,
            set: {
              questionText: item.questionText,
              options: item.options,
              correctAnswer: item.correctAnswer,
              explanation: item.explanation,
              difficulty: item.difficulty,
              topicId: item.topicId,
              subjectId: item.subjectId,
              levelId: item.levelId,
            },
          });
      }
      console.log(`   ✅ ${exportData.data.questions.length} questions\n`);
    }

    // 6. Quizzes
    if (exportData.data.quizzes?.length > 0) {
      console.log("📝 Importing quizzes...");
      for (const item of exportData.data.quizzes) {
        await prodDb
          .insert(quizzes)
          .values(item)
          .onConflictDoUpdate({
            target: quizzes.id,
            set: {
              userId: item.userId,
              type: item.type,
              subjectId: item.subjectId,
              levelId: item.levelId,
              topicId: item.topicId,
              status: item.status,
              totalQuestions: item.totalQuestions,
              correctAnswers: item.correctAnswers,
              score: item.score,
              completedAt: item.completedAt,
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
