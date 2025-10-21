import { db } from "../server/db";
import { topics } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateTopicContent } from "../server/aiService";

const REMAINING_TOPICS = [
  // Form 3 (3 remaining)
  { id: "topic-math-f3-surds", form: "Form 3" },
  { id: "topic-math-f3-vectors1", form: "Form 3" },
  { id: "topic-math-f3-statistics1", form: "Form 3" },
  // Form 4 (7 topics)
  { id: "topic-math-f4-trigonometry2", form: "Form 4" },
  { id: "topic-math-f4-vectors2", form: "Form 4" },
  { id: "topic-math-f4-matrices", form: "Form 4" },
  { id: "topic-math-f4-statistics2", form: "Form 4" },
  { id: "topic-math-f4-probability", form: "Form 4" },
  { id: "topic-math-f4-linear", form: "Form 4" },
  { id: "topic-math-f4-calculus", form: "Form 4" },
];

async function generateContentForTopic(topicId: string, form: string, index: number, total: number): Promise<boolean> {
  try {
    console.log(`\n[${index + 1}/${total}] Processing ${form} topic: ${topicId}`);
    
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    if (!topic) {
      console.error(`❌ Topic not found: ${topicId}`);
      return false;
    }

    console.log(`📝 "${topic.title}"`);
    console.log(`🤖 Generating AI content...`);
    
    const content = await generateTopicContent({
      title: topic.title,
      description: topic.description || "",
      subject: "Mathematics",
      level: form,
    });

    await db
      .update(topics)
      .set({ summaryContent: content })
      .where(eq(topics.id, topicId));

    console.log(`✅ Success! (${content.length} characters)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

async function main() {
  console.log("\n🚀 Completing Mathematics Content Generation");
  console.log(`📋 Remaining topics: ${REMAINING_TOPICS.length}\n`);

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < REMAINING_TOPICS.length; i++) {
    const { id, form } = REMAINING_TOPICS[i];
    
    const result = await generateContentForTopic(id, form, i, REMAINING_TOPICS.length);
    
    if (result) {
      successful++;
    } else {
      failed++;
    }

    // Small delay between requests
    if (i < REMAINING_TOPICS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 FINAL SUMMARY:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`${'='.repeat(60)}\n`);
}

main()
  .then(() => {
    console.log("✨ Mathematics content generation complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
