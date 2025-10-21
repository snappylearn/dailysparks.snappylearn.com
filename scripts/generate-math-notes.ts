import { db } from "../server/db";
import { topics } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { generateTopicContent } from "../server/aiService";

const MATHEMATICS_TOPICS_BY_FORM = {
  "Form 1": [
    "topic-math-f1-numbers",
    "topic-math-f1-algebra1",
    "topic-math-f1-measurements",
    "topic-math-f1-geometry1",
    "topic-math-f1-ratio",
    "topic-math-f1-percentages",
    "topic-math-f1-commercial1",
    "topic-math-f1-integers",
  ],
  "Form 2": [
    "topic-math-f2-geometry2",
    "topic-math-f2-algebra2",
    "topic-math-f2-circle",
    "topic-math-f2-commercial2",
    "topic-math-f2-indices",
    "topic-math-f2-coordinates",
  ],
  "Form 3": [
    "topic-math-f3-quadratic",
    "topic-math-f3-approximation",
    "topic-math-f3-trigonometry1",
    "topic-math-f3-commercial3",
    "topic-math-f3-surds",
    "topic-math-f3-vectors1",
    "topic-math-f3-statistics1",
  ],
  "Form 4": [
    "topic-math-f4-trigonometry2",
    "topic-math-f4-vectors2",
    "topic-math-f4-matrices",
    "topic-math-f4-statistics2",
    "topic-math-f4-probability",
    "topic-math-f4-linear",
    "topic-math-f4-calculus",
  ],
};

async function generateContentForTopic(topicId: string): Promise<boolean> {
  try {
    console.log(`\n📝 Generating content for topic: ${topicId}`);
    
    // Get topic details
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    if (!topic) {
      console.error(`❌ Topic not found: ${topicId}`);
      return false;
    }

    // Check if content already exists
    if (topic.summaryContent && topic.summaryContent.trim().length > 100) {
      console.log(`✅ Content already exists for "${topic.title}" - Skipping`);
      return true;
    }

    console.log(`🤖 Generating AI content for "${topic.title}"...`);
    
    // Generate content using AI
    const content = await generateTopicContent({
      title: topic.title,
      description: topic.description || "",
      subject: "Mathematics",
      level: "Secondary",
    });

    // Update topic with generated content
    await db
      .update(topics)
      .set({ 
        summaryContent: content,
      })
      .where(eq(topics.id, topicId));

    console.log(`✅ Successfully generated content for "${topic.title}"`);
    console.log(`   Content length: ${content.length} characters`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error generating content for ${topicId}:`, error);
    return false;
  }
}

async function generateContentForForm(formName: string, topicIds: string[]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 GENERATING CONTENT FOR ${formName} MATHEMATICS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total topics: ${topicIds.length}\n`);

  let successful = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < topicIds.length; i++) {
    const topicId = topicIds[i];
    console.log(`\n[${i + 1}/${topicIds.length}] Processing topic: ${topicId}`);
    
    const result = await generateContentForTopic(topicId);
    
    if (result) {
      // Check if content was newly generated or already existed
      const [topic] = await db
        .select()
        .from(topics)
        .where(eq(topics.id, topicId))
        .limit(1);
      
      if (topic?.summaryContent && topic.summaryContent.trim().length > 100) {
        successful++;
      } else {
        skipped++;
      }
    } else {
      failed++;
    }

    // Add a small delay between requests to avoid rate limiting
    if (i < topicIds.length - 1) {
      console.log("⏳ Waiting 3 seconds before next topic...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${formName} SUMMARY:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`${'='.repeat(60)}\n`);

  return { successful, skipped, failed };
}

async function main() {
  console.log("\n🚀 Starting Mathematics Content Generation\n");
  console.log("This will generate study notes for all Mathematics topics");
  console.log("from Form 1 to Form 4 systematically.\n");

  const overallStats = {
    successful: 0,
    skipped: 0,
    failed: 0,
  };

  for (const [formName, topicIds] of Object.entries(MATHEMATICS_TOPICS_BY_FORM)) {
    const stats = await generateContentForForm(formName, topicIds);
    
    overallStats.successful += stats.successful;
    overallStats.skipped += stats.skipped;
    overallStats.failed += stats.failed;

    // Pause between forms for review
    if (formName !== "Form 4") {
      console.log("\n⏸️  Pausing for 5 seconds before next form...\n");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 OVERALL SUMMARY - ALL FORMS");
  console.log("=".repeat(60));
  console.log(`   ✅ Total Successful: ${overallStats.successful}`);
  console.log(`   ⏭️  Total Skipped: ${overallStats.skipped}`);
  console.log(`   ❌ Total Failed: ${overallStats.failed}`);
  console.log(`   📚 Total Topics Processed: ${overallStats.successful + overallStats.skipped + overallStats.failed}`);
  console.log("=".repeat(60) + "\n");

  console.log("✨ Mathematics content generation complete!\n");
}

main()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
