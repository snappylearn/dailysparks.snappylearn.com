import { db } from "./server/db";
import { topics, subjects } from "./shared/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("\n📊 KCSE Content Generation Status Report");
  console.log("=" + "=".repeat(70) + "\n");

  const statusResults = await db
    .select({
      subject: subjects.name,
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN ${topics.summaryContent} IS NOT NULL AND LENGTH(${topics.summaryContent}) > 100 THEN 1 ELSE 0 END)`,
      remaining: sql<number>`COUNT(*) - SUM(CASE WHEN ${topics.summaryContent} IS NOT NULL AND LENGTH(${topics.summaryContent}) > 100 THEN 1 ELSE 0 END)`,
      avgLength: sql<number>`ROUND(AVG(CASE WHEN ${topics.summaryContent} IS NOT NULL THEN LENGTH(${topics.summaryContent}) ELSE 0 END))`,
    })
    .from(topics)
    .innerJoin(subjects, sql`${topics.subjectId} = ${subjects.id}`)
    .groupBy(subjects.name);

  // Calculate totals
  const totals = statusResults.reduce(
    (acc, row) => ({
      total: acc.total + Number(row.total),
      completed: acc.completed + Number(row.completed),
      remaining: acc.remaining + Number(row.remaining),
    }),
    { total: 0, completed: 0, remaining: 0 }
  );

  // Icon mapping
  const icons: Record<string, string> = {
    Mathematics: "🔢",
    Chemistry: "🧪",
    Biology: "🧬",
    Physics: "⚡",
    "History & Government": "📜",
    "Business Studies": "💼",
    "Computer Studies": "💻",
    Agriculture: "🌾",
    "Home Science": "🏠",
    Music: "🎵",
  };

  // Sort results by completion (descending) then total (descending)
  const sortedResults = statusResults.sort((a, b) => {
    const aCompleted = Number(a.completed);
    const bCompleted = Number(b.completed);
    if (aCompleted !== bCompleted) return bCompleted - aCompleted;
    return Number(b.total) - Number(a.total);
  });

  // Print results
  sortedResults.forEach((row) => {
    const subject = row.subject;
    const icon = icons[subject] || "📚";
    const completed = Number(row.completed);
    const total = Number(row.total);
    const remaining = Number(row.remaining);
    const percent = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
    const avgLen = Number(row.avgLength);

    const status = completed === total ? "✅" : remaining > 0 ? "⏳" : "❌";
    const bar = "█".repeat(Math.floor(Number(percent) / 5)) + "░".repeat(20 - Math.floor(Number(percent) / 5));

    console.log(`${status} ${icon} ${subject}`);
    console.log(`   Progress: ${bar} ${percent}%`);
    console.log(`   Topics: ${completed}/${total} complete (${remaining} remaining)`);
    if (avgLen > 0) {
      console.log(`   Avg Length: ${avgLen.toLocaleString()} characters`);
    }
    console.log();
  });

  // Print totals
  const totalPercent = totals.total > 0 ? ((totals.completed / totals.total) * 100).toFixed(1) : "0.0";
  console.log("=" + "=".repeat(70));
  console.log("📈 OVERALL SUMMARY");
  console.log("=" + "=".repeat(70));
  console.log(`Total Topics: ${totals.total}`);
  console.log(`Completed: ${totals.completed} (${totalPercent}%)`);
  console.log(`Remaining: ${totals.remaining}`);
  console.log("=" + "=".repeat(70) + "\n");

  // Print recommendations
  if (totals.remaining > 0) {
    console.log("🎯 RECOMMENDED NEXT STEPS:\n");

    const incomplete = statusResults
      .filter((row) => Number(row.remaining) > 0)
      .sort((a, b) => Number(a.remaining) - Number(b.remaining));

    incomplete.forEach((row, index) => {
      const scriptName = row.subject
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace("&", "");
      console.log(
        `${index + 1}. ${icons[row.subject] || "📚"} ${row.subject}: npx tsx generate-${scriptName}-notes.ts`
      );
    });
    console.log();
  } else {
    console.log("🎉 ALL CONTENT GENERATION COMPLETE! 🎉\n");
  }
}

main()
  .then(() => {
    console.log("✨ Status check complete\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
