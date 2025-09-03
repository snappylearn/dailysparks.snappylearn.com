#!/usr/bin/env tsx

import { db } from "../server/db";
import { 
  examinationSystems, 
  levels, 
  subjects, 
  terms,
  topics,
  questions,
  quizzes,
  quizSessions,
  userAnswers,
  profiles,
  users,
  challenges,
  badges,
  badgeTypes,
  trophies,
  userBadges,
  userTrophies,
  userChallenges,
  adminUsers,
  sessions,
  quizTypes
} from "../shared/schema";
import { readFileSync } from "fs";
import path from "path";

// Helper function to convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

// Transform object keys from snake_case to camelCase and handle date strings
function transformKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        let value = transformKeys(obj[key]);
        
        // Convert ISO date strings to Date objects for timestamp fields
        if (typeof value === 'string' && 
            (camelKey.includes('At') || camelKey.includes('Date') || camelKey.includes('Activity') || 
             key.includes('_at') || key.includes('_date') || key.includes('activity')) &&
            value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          value = new Date(value);
        }
        
        transformed[camelKey] = value;
      }
    }
    return transformed;
  }
  return obj;
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding process...");

  try {
    // Read the data file
    const dataPath = path.join(process.cwd(), "attached_assets/neon_export_1756892131194.json");
    const rawData = readFileSync(dataPath, "utf8");
    const rawDataObj = JSON.parse(rawData);
    
    // Transform all data to use camelCase field names
    const data = transformKeys(rawDataObj);

    console.log("📊 Loaded data file with", Object.keys(data).length, "data categories");

    // Seed in dependency order to avoid foreign key issues

    // 1. Core system setup - Examination Systems
    if (data.examination_systems?.length > 0) {
      console.log("📚 Seeding examination systems...");
      await db.insert(examinationSystems).values(data.examination_systems).onConflictDoNothing();
      console.log(`✅ Inserted ${data.examination_systems.length} examination systems`);
    }

    // 2. Levels (depends on examination systems)
    if (data.levels?.length > 0) {
      console.log("📈 Seeding levels...");
      await db.insert(levels).values(data.levels).onConflictDoNothing();
      console.log(`✅ Inserted ${data.levels.length} levels`);
    }

    // 3. Subjects (depends on examination systems)
    if (data.subjects?.length > 0) {
      console.log("📖 Seeding subjects...");
      await db.insert(subjects).values(data.subjects).onConflictDoNothing();
      console.log(`✅ Inserted ${data.subjects.length} subjects`);
    }

    // 4. Terms (depends on examination systems)
    if (data.terms?.length > 0) {
      console.log("📅 Seeding terms...");
      await db.insert(terms).values(data.terms).onConflictDoNothing();
      console.log(`✅ Inserted ${data.terms.length} terms`);
    }

    // 5. Topics (depends on subjects, levels, terms, examination systems)
    if (data.topics?.length > 0) {
      console.log("🎯 Seeding topics...");
      await db.insert(topics).values(data.topics).onConflictDoNothing();
      console.log(`✅ Inserted ${data.topics.length} topics`);
    }

    // 6. Questions (depends on topics)
    if (data.questions?.length > 0) {
      console.log("❓ Seeding questions...");
      // Process questions in batches to avoid memory issues
      const batchSize = 1000;
      const questionBatches = [];
      for (let i = 0; i < data.questions.length; i += batchSize) {
        questionBatches.push(data.questions.slice(i, i + batchSize));
      }
      
      for (const [index, batch] of questionBatches.entries()) {
        console.log(`   Processing questions batch ${index + 1}/${questionBatches.length} (${batch.length} questions)...`);
        await db.insert(questions).values(batch as any).onConflictDoNothing();
      }
      console.log(`✅ Inserted ${data.questions.length} questions`);
    }

    // 7. Users (independent)
    if (data.users?.length > 0) {
      console.log("👥 Seeding users...");
      await db.insert(users).values(data.users).onConflictDoNothing();
      console.log(`✅ Inserted ${data.users.length} users`);
    }

    // 8. Admin Users (independent)
    if (data.adminUsers?.length > 0) {
      console.log("👨‍💼 Seeding admin users...");
      await db.insert(adminUsers).values(data.adminUsers).onConflictDoNothing();
      console.log(`✅ Inserted ${data.adminUsers.length} admin users`);
    }

    // 9. Badge Types (independent) - MUST come before badges
    if (data.badgeTypes?.length > 0) {
      console.log("🏷️ Seeding badge types...");
      await db.insert(badgeTypes).values(data.badgeTypes).onConflictDoNothing();
      console.log(`✅ Inserted ${data.badgeTypes.length} badge types`);
    }

    // 10. Profiles (depends on users, examination systems, levels)
    if (data.profiles?.length > 0) {
      console.log("👤 Seeding profiles...");
      await db.insert(profiles).values(data.profiles).onConflictDoNothing();
      console.log(`✅ Inserted ${data.profiles.length} profiles`);
    }

    // 11. Badges (depends on badge types)
    if (data.badges?.length > 0) {
      console.log("🎖️ Seeding badges...");
      await db.insert(badges).values(data.badges).onConflictDoNothing();
      console.log(`✅ Inserted ${data.badges.length} badges`);
    }

    // 12. Trophies (independent)
    if (data.trophies?.length > 0) {
      console.log("🏆 Seeding trophies...");
      await db.insert(trophies).values(data.trophies).onConflictDoNothing();
      console.log(`✅ Inserted ${data.trophies.length} trophies`);
    }

    // 13. Challenges (may depend on badges)
    if (data.challenges?.length > 0) {
      console.log("⚡ Seeding challenges...");
      await db.insert(challenges).values(data.challenges).onConflictDoNothing();
      console.log(`✅ Inserted ${data.challenges.length} challenges`);
    }

    // 14. Quiz Types (independent)
    if (data.quizTypes?.length > 0) {
      console.log("📝 Seeding quiz types...");
      await db.insert(quizTypes).values(data.quizTypes).onConflictDoNothing();
      console.log(`✅ Inserted ${data.quizTypes.length} quiz types`);
    }

    // 15. Quizzes (depends on examination systems, levels, subjects, users)
    if (data.quizzes?.length > 0) {
      console.log("📋 Seeding quizzes...");
      await db.insert(quizzes).values(data.quizzes).onConflictDoNothing();
      console.log(`✅ Inserted ${data.quizzes.length} quizzes`);
    }

    // 16. Quiz Sessions (depends on users, profiles, subjects)
    if (data.quizSessions?.length > 0) {
      console.log("🎮 Seeding quiz sessions...");
      // Process in batches for large datasets
      const batchSize = 500;
      const sessionBatches = [];
      for (let i = 0; i < data.quizSessions.length; i += batchSize) {
        sessionBatches.push(data.quizSessions.slice(i, i + batchSize));
      }
      
      for (const [index, batch] of sessionBatches.entries()) {
        console.log(`   Processing quiz sessions batch ${index + 1}/${sessionBatches.length} (${batch.length} sessions)...`);
        await db.insert(quizSessions).values(batch as any).onConflictDoNothing();
      }
      console.log(`✅ Inserted ${data.quizSessions.length} quiz sessions`);
    }

    // 17. User Answers (depends on quiz sessions)
    if (data.userAnswers?.length > 0) {
      console.log("✏️ Seeding user answers...");
      // Process in batches for large datasets
      const batchSize = 2000;
      const answerBatches = [];
      for (let i = 0; i < data.userAnswers.length; i += batchSize) {
        answerBatches.push(data.userAnswers.slice(i, i + batchSize));
      }
      
      for (const [index, batch] of answerBatches.entries()) {
        console.log(`   Processing user answers batch ${index + 1}/${answerBatches.length} (${batch.length} answers)...`);
        await db.insert(userAnswers).values(batch as any).onConflictDoNothing();
      }
      console.log(`✅ Inserted ${data.userAnswers.length} user answers`);
    }

    // 18. User Badges (depends on users, badges)
    if (data.userBadges?.length > 0) {
      console.log("🎖️ Seeding user badges...");
      await db.insert(userBadges).values(data.userBadges).onConflictDoNothing();
      console.log(`✅ Inserted ${data.userBadges.length} user badges`);
    }

    // 19. User Trophies (depends on users, trophies)
    if (data.userTrophies?.length > 0) {
      console.log("🏆 Seeding user trophies...");
      await db.insert(userTrophies).values(data.userTrophies).onConflictDoNothing();
      console.log(`✅ Inserted ${data.userTrophies.length} user trophies`);
    }

    // 20. User Challenges (depends on users, challenges)
    if (data.userChallenges?.length > 0) {
      console.log("⚡ Seeding user challenges...");
      await db.insert(userChallenges).values(data.userChallenges).onConflictDoNothing();
      console.log(`✅ Inserted ${data.userChallenges.length} user challenges`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("📊 Summary of seeded data:");
    
    // Print summary
    const summary = Object.keys(data).map(key => ({
      table: key,
      count: data[key]?.length || 0
    })).filter(item => item.count > 0);
    
    summary.forEach(({ table, count }) => {
      console.log(`   ${table}: ${count.toLocaleString()} records`);
    });
    
    const totalRecords = summary.reduce((sum, item) => sum + item.count, 0);
    console.log(`\n📈 Total records seeded: ${totalRecords.toLocaleString()}`);

  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}

// Run the seeding process
seedDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});