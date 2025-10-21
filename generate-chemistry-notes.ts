import { db } from "./server/db";
import { topics, subjects, levels } from "./shared/schema";
import { eq, and, isNull, or, sql } from "drizzle-orm";
import { generateTopicContent } from "./server/aiService";

async function main() {
  console.log("\n🧪 Chemistry Content Generation for Forms 1-4");
  console.log("=" + "=".repeat(60) + "\n");

  // Get Chemistry subject
  const [chemSubject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, "Chemistry"))
    .limit(1);

  if (!chemSubject) {
    console.log("❌ Chemistry subject not found");
    process.exit(1);
  }

  // Get all Chemistry topics without content, ordered by level
  const chemTopics = await db
    .select({
      id: topics.id,
      title: topics.title,
      description: topics.description,
      levelTitle: levels.title,
      levelOrder: levels.order,
      topicOrder: topics.order,
    })
    .from(topics)
    .innerJoin(levels, eq(topics.levelId, levels.id))
    .where(
      and(
        eq(topics.subjectId, chemSubject.id),
        or(
          isNull(topics.summaryContent),
          sql`LENGTH(${topics.summaryContent}) < 100`
        )
      )
    )
    .orderBy(levels.order, topics.order);

  console.log(`📋 Found ${chemTopics.length} Chemistry topics to process\n`);

  if (chemTopics.length === 0) {
    console.log("✅ All Chemistry topics already have content!");
    process.exit(0);
  }

  let completed = 0;
  let failed = 0;

  for (let i = 0; i < chemTopics.length; i++) {
    const topic = chemTopics[i];
    console.log(`\n[${i + 1}/${chemTopics.length}] ${topic.levelTitle} - ${topic.title}`);
    console.log(`📝 ID: ${topic.id}`);

    try {
      console.log(`🤖 Generating AI content...`);

      const content = await generateTopicContent({
        title: topic.title,
        description: topic.description || "",
        subject: "Chemistry",
        level: topic.levelTitle,
      });

      await db
        .update(topics)
        .set({ summaryContent: content })
        .where(eq(topics.id, topic.id));

      console.log(`✅ Success! (${content.length} characters)`);
      completed++;

      // Wait 3 seconds between API calls to avoid rate limits
      if (i < chemTopics.length - 1) {
        console.log(`⏳ Waiting 3 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Chemistry Content Generation Summary");
  console.log("=".repeat(60));
  console.log(`✅ Completed: ${completed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📚 Total: ${chemTopics.length}`);
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => {
    console.log("✨ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script error:", error);
    process.exit(1);
  });
