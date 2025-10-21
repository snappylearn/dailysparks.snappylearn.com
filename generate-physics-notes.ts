import { db } from "./server/db";
import { topics, subjects, levels } from "./shared/schema";
import { eq, and, isNull, or, sql } from "drizzle-orm";
import { generateTopicContent } from "./server/aiService";

async function main() {
  console.log("\n⚡ Physics Content Generation for Forms 1-4");
  console.log("=" + "=".repeat(60) + "\n");

  // Get Physics subject
  const [physicsSubject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, "Physics"))
    .limit(1);

  if (!physicsSubject) {
    console.log("❌ Physics subject not found");
    process.exit(1);
  }

  // Get all Physics topics without content, ordered by level
  const physicsTopics = await db
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
        eq(topics.subjectId, physicsSubject.id),
        or(
          isNull(topics.summaryContent),
          sql`LENGTH(${topics.summaryContent}) < 100`
        )
      )
    )
    .orderBy(levels.order, topics.order);

  console.log(`📋 Found ${physicsTopics.length} Physics topics to process\n`);

  if (physicsTopics.length === 0) {
    console.log("✅ All Physics topics already have content!");
    process.exit(0);
  }

  let completed = 0;
  let failed = 0;

  for (let i = 0; i < physicsTopics.length; i++) {
    const topic = physicsTopics[i];
    console.log(`\n[${i + 1}/${physicsTopics.length}] ${topic.levelTitle} - ${topic.title}`);
    console.log(`📝 ID: ${topic.id}`);

    try {
      console.log(`🤖 Generating AI content...`);

      const content = await generateTopicContent({
        title: topic.title,
        description: topic.description || "",
        subject: "Physics",
        level: topic.levelTitle,
      });

      await db
        .update(topics)
        .set({ summaryContent: content })
        .where(eq(topics.id, topic.id));

      console.log(`✅ Success! (${content.length} characters)`);
      completed++;

      // Wait 3 seconds between API calls to avoid rate limits
      if (i < physicsTopics.length - 1) {
        console.log(`⏳ Waiting 3 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Physics Content Generation Summary");
  console.log("=".repeat(60));
  console.log(`✅ Completed: ${completed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📚 Total: ${physicsTopics.length}`);
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
