import { db } from "./server/db";
import { 
  examinationSystems, 
  levels, 
  subjects, 
  topics, 
  questions,
  quizzes 
} from "./shared/schema";
import { writeFile } from "fs/promises";

async function exportData() {
  console.log("\n📦 Exporting Development Database Data");
  console.log("=" + "=".repeat(60) + "\n");

  try {
    // Export all data
    console.log("📋 Fetching examination systems...");
    const examSystems = await db.select().from(examinationSystems);
    console.log(`   ✅ ${examSystems.length} examination systems`);

    console.log("📋 Fetching levels...");
    const levelsData = await db.select().from(levels);
    console.log(`   ✅ ${levelsData.length} levels`);

    console.log("📋 Fetching subjects...");
    const subjectsData = await db.select().from(subjects);
    console.log(`   ✅ ${subjectsData.length} subjects`);

    console.log("📋 Fetching topics...");
    const topicsData = await db.select().from(topics);
    console.log(`   ✅ ${topicsData.length} topics`);

    console.log("📋 Fetching questions...");
    const questionsData = await db.select().from(questions);
    console.log(`   ✅ ${questionsData.length} questions`);

    console.log("📋 Fetching quizzes...");
    const quizzesData = await db.select().from(quizzes);
    console.log(`   ✅ ${quizzesData.length} quizzes`);

    // Create export object
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      data: {
        examinationSystems: examSystems,
        levels: levelsData,
        subjects: subjectsData,
        topics: topicsData,
        questions: questionsData,
        quizzes: quizzesData,
      },
      summary: {
        examinationSystems: examSystems.length,
        levels: levelsData.length,
        subjects: subjectsData.length,
        topics: topicsData.length,
        questions: questionsData.length,
        quizzes: quizzesData.length,
      },
    };

    // Write to file
    const filename = `database-export-${Date.now()}.json`;
    await writeFile(filename, JSON.stringify(exportData, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("✅ Export Complete!");
    console.log("=".repeat(60));
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Total records: ${
      examSystems.length +
      levelsData.length +
      subjectsData.length +
      topicsData.length +
      questionsData.length +
      quizzesData.length
    }`);
    console.log("=".repeat(60) + "\n");

    return filename;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

exportData()
  .then((filename) => {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Download ${filename}`);
    console.log(`2. Get production database credentials from Replit`);
    console.log(`3. Run import script with production credentials\n`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
