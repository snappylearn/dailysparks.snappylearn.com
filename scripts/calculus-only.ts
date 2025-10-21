import { db } from "../server/db";
import { topics } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateTopicContent } from "../server/aiService";

async function main() {
  console.log("\n📝 Final Topic: Calculus (Differentiation and Integration)\n");
  
  const topicId = "topic-math-f4-calculus";
  
  const [topic] = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);
  
  if (!topic) {
    console.log("❌ Topic not found");
    process.exit(1);
  }

  console.log(`🤖 Generating AI content...`);
  
  const content = await generateTopicContent({
    title: topic.title,
    description: topic.description || "",
    subject: "Mathematics",
    level: "Form 4",
  });

  await db.update(topics).set({ summaryContent: content }).where(eq(topics.id, topicId));
  
  console.log(`✅ Success! Generated ${content.length} characters\n`);
  console.log("🎉 ALL 29 MATHEMATICS TOPICS NOW COMPLETE!\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
