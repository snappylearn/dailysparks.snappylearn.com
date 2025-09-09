import { readFileSync } from 'fs';
import { db } from '../server/db';
import { 
  users, 
  examinationSystems, 
  levels, 
  subjects, 
  profiles, 
  topics, 
  questions, 
  quizSessions, 
  userAnswers,
  sessions,
  terms,
  quizTypes,
  questionTypes,
  quizzes,
  quizQuestions,
  quizQuestionChoices,
  badgeTypes,
  badges,
  trophies,
  challenges,
  userChallenges,
  userBadges,
  userTrophies
} from '../shared/schema';

interface ImportData {
  quiz_sessions: any[];
  sessions: any[];
  questions: any[];
  subjects: any[];
  examination_systems: any[];
  levels: any[];
  profiles: any[];
  user_answers: any[];
  users: any[];
  topics: any[];
  terms: any[];
  quiz_types: any[];
  question_types: any[];
  quizzes: any[];
  quiz_questions: any[];
  quiz_question_choices: any[];
  badge_types: any[];
  badges: any[];
  trophies: any[];
  challenges: any[];
  user_challenges: any[];
  user_badges: any[];
  user_trophies: any[];
  // Optional tables we might not need
  general_settings?: any[];
  quiz_settings?: any[];
  notification_settings?: any[];
  subscription_plans?: any[];
  credit_transactions?: any[];
  payment_transactions?: any[];
}

async function importData() {
  try {
    console.log('🚀 Starting data import...');
    
    // Read and parse the JSON file
    const jsonData = readFileSync('attached_assets/neon_export (1)_1757399020679.json', 'utf8');
    const data: ImportData = JSON.parse(jsonData);
    
    console.log('📊 Data structure found:');
    Object.keys(data).forEach(key => {
      console.log(`  - ${key}: ${data[key as keyof ImportData]?.length || 0} records`);
    });

    // Import in the correct order (respecting foreign key constraints)
    
    // 1. Import examination systems first
    if (data.examination_systems?.length) {
      console.log('\n📚 Importing examination systems...');
      for (const system of data.examination_systems) {
        await db.insert(examinationSystems)
          .values({
            id: system.id,
            name: system.name,
            code: system.code,
            description: system.description,
            country: system.country,
            isActive: system.is_active ?? true,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.examination_systems.length} examination systems`);
    }

    // 2. Import levels
    if (data.levels?.length) {
      console.log('\n📈 Importing levels...');
      for (const level of data.levels) {
        await db.insert(levels)
          .values({
            id: level.id,
            title: level.title,
            description: level.description,
            examinationSystemId: level.examination_system_id,
            order: level.order || 0,
            isActive: level.is_active ?? true,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.levels.length} levels`);
    }

    // 3. Import subjects
    if (data.subjects?.length) {
      console.log('\n📖 Importing subjects...');
      for (const subject of data.subjects) {
        await db.insert(subjects)
          .values({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            examinationSystemId: subject.examination_system_id,
            icon: subject.icon,
            color: subject.color,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.subjects.length} subjects`);
    }

    // 4. Import users (preserve existing users)
    if (data.users?.length) {
      console.log('\n👥 Importing users...');
      
      // Get existing users to avoid overwriting them
      const existingUsers = await db.select({ id: users.id }).from(users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      
      const newUsers = data.users.filter(user => !existingUserIds.has(user.id));
      console.log(`🔍 Found ${existingUserIds.size} existing users to preserve, importing ${newUsers.length} new users`);
      
      for (const user of newUsers) {
        await db.insert(users)
          .values({
            id: user.id,
            email: user.email,
            firstName: user.first_name || user.firstName,
            lastName: user.last_name || user.lastName,
            profileImageUrl: user.profile_image_url || user.profileImageUrl,
            defaultProfileId: user.default_profile_id || user.defaultProfileId,
            isPremium: user.is_premium || user.isPremium || false,
            credits: user.credits?.toString() || "0.00",
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${newUsers.length} new users (preserved ${existingUserIds.size} existing)`);
    }

    // 4.5. Import terms (needed before topics)
    if (data.terms?.length) {
      console.log('\n📅 Importing terms...');
      for (const term of data.terms) {
        await db.insert(terms)
          .values({
            id: term.id,
            examinationSystemId: term.examination_system_id,
            title: term.title,
            description: term.description,
            order: term.order || 0,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.terms.length} terms`);
    }

    // 5. Import profiles
    if (data.profiles?.length) {
      console.log('\n👤 Importing profiles...');
      for (const profile of data.profiles) {
        await db.insert(profiles)
          .values({
            id: profile.id,
            userId: profile.user_id,
            examinationSystemId: profile.examination_system_id,
            levelId: profile.level_id,
            currentTerm: profile.current_term || 'Term 1',
            sparks: profile.sparks || 0,
            streak: profile.streak || 0,
            currentStreak: profile.current_streak || 0,
            longestStreak: profile.longest_streak || 0,
            rank: profile.rank,
            lastQuizDate: profile.last_quiz_date ? new Date(profile.last_quiz_date) : null,
            lastActivity: profile.last_activity ? new Date(profile.last_activity) : new Date(),
            isActive: profile.is_active ?? true,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.profiles.length} profiles`);
    }

    // 6. Import topics
    if (data.topics?.length) {
      console.log('\n📚 Importing topics...');
      for (const topic of data.topics) {
        await db.insert(topics)
          .values({
            id: topic.id,
            examinationSystemId: topic.examination_system_id,
            subjectId: topic.subject_id,
            levelId: topic.level_id,
            termId: topic.term_id,
            title: topic.title,
            description: topic.description,
            summaryContent: topic.summary_content,
            order: topic.order || 0,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.topics.length} topics`);
    }

    // 7. Import questions
    if (data.questions?.length) {
      console.log('\n❓ Importing questions...');
      for (const question of data.questions) {
        await db.insert(questions)
          .values({
            id: question.id,
            topicId: question.topic_id,
            questionText: question.question_text,
            optionA: question.option_a,
            optionB: question.option_b,
            optionC: question.option_c,
            optionD: question.option_d,
            correctAnswer: question.correct_answer,
            explanation: question.explanation,
            difficulty: question.difficulty || 'medium',
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.questions.length} questions`);
    }

    // 8. Import quiz sessions
    if (data.quiz_sessions?.length) {
      console.log('\n🎯 Importing quiz sessions...');
      for (const session of data.quiz_sessions) {
        await db.insert(quizSessions)
          .values({
            id: session.id,
            userId: session.user_id,
            profileId: session.profile_id,
            subjectId: session.subject_id,
            quizType: session.quiz_type,
            topicId: session.topic_id,
            termId: session.term_id,
            quizQuestions: session.quiz_questions || null,
            totalQuestions: session.total_questions || 30,
            currentQuestionIndex: session.current_question_index || 0,
            correctAnswers: session.correct_answers || 0,
            sparksEarned: session.sparks_earned || 0,
            timeSpent: session.time_spent,
            completed: session.completed || false,
            startedAt: session.started_at ? new Date(session.started_at) : new Date(),
            completedAt: session.completed_at ? new Date(session.completed_at) : null,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.quiz_sessions.length} quiz sessions`);
    }

    // 9. Import user answers
    if (data.user_answers?.length) {
      console.log('\n💡 Importing user answers...');
      for (const answer of data.user_answers) {
        await db.insert(userAnswers)
          .values({
            id: answer.id,
            quizSessionId: answer.quiz_session_id,
            questionId: answer.question_id,
            userAnswer: answer.user_answer,
            isCorrect: answer.is_correct,
            timeSpent: answer.time_spent,
            answeredAt: answer.answered_at ? new Date(answer.answered_at) : new Date(),
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.user_answers.length} user answers`);
    }

    // 10. Import sessions (for session management)
    if (data.sessions?.length) {
      console.log('\n🔐 Importing sessions...');
      for (const session of data.sessions) {
        await db.insert(sessions)
          .values({
            sid: session.sid,
            sess: session.sess,
            expire: new Date(session.expire),
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.sessions.length} sessions`);
    }

    // 10.5. Import gamification data
    if (data.badge_types?.length) {
      console.log('\n🏷️ Importing badge types...');
      for (const badgeType of data.badge_types) {
        await db.insert(badgeTypes)
          .values({
            id: badgeType.id,
            title: badgeType.title,
            description: badgeType.description,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.badge_types.length} badge types`);
    }

    if (data.badges?.length) {
      console.log('\n🥇 Importing badges...');
      for (const badge of data.badges) {
        await db.insert(badges)
          .values({
            id: badge.id,
            title: badge.title,
            description: badge.description,
            sparks: badge.sparks,
            icon: badge.icon,
            badgeTypeId: badge.badge_type_id,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.badges.length} badges`);
    }

    if (data.trophies?.length) {
      console.log('\n🏆 Importing trophies...');
      for (const trophy of data.trophies) {
        await db.insert(trophies)
          .values({
            id: trophy.id,
            title: trophy.title,
            description: trophy.description,
            icon: trophy.icon,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.trophies.length} trophies`);
    }

    if (data.challenges?.length) {
      console.log('\n🎯 Importing challenges...');
      for (const challenge of data.challenges) {
        await db.insert(challenges)
          .values({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            sparks: challenge.sparks || 0,
            streaks: challenge.streaks || 0,
            badgeId: challenge.badge_id,
            isActive: challenge.is_active ?? true,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.challenges.length} challenges`);
    }

    if (data.user_challenges?.length) {
      console.log('\n👤🎯 Importing user challenges...');
      for (const userChallenge of data.user_challenges) {
        await db.insert(userChallenges)
          .values({
            id: userChallenge.id,
            userId: userChallenge.user_id,
            challengeId: userChallenge.challenge_id,
            completed: userChallenge.completed || false,
            progress: userChallenge.progress || 0,
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.user_challenges.length} user challenges`);
    }

    if (data.user_badges?.length) {
      console.log('\n👤🥇 Importing user badges...');
      for (const userBadge of data.user_badges) {
        await db.insert(userBadges)
          .values({
            id: userBadge.id,
            userId: userBadge.user_id,
            badgeId: userBadge.badge_id,
            count: userBadge.count || 1,
            streaks: userBadge.streaks || 0,
            lastEarnedAt: userBadge.last_earned_at ? new Date(userBadge.last_earned_at) : new Date(),
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.user_badges.length} user badges`);
    }

    if (data.user_trophies?.length) {
      console.log('\n👤🏆 Importing user trophies...');
      for (const userTrophy of data.user_trophies) {
        await db.insert(userTrophies)
          .values({
            id: userTrophy.id,
            userId: userTrophy.user_id,
            trophyId: userTrophy.trophy_id,
            count: userTrophy.count || 1,
            lastEarnedAt: userTrophy.last_earned_at ? new Date(userTrophy.last_earned_at) : new Date(),
          })
          .onConflictDoNothing();
      }
      console.log(`✅ Imported ${data.user_trophies.length} user trophies`);
    }

    console.log('\n🎉 Data import completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  - Examination Systems: ${data.examination_systems?.length || 0}`);
    console.log(`  - Levels: ${data.levels?.length || 0}`);
    console.log(`  - Subjects: ${data.subjects?.length || 0}`);
    console.log(`  - Terms: ${data.terms?.length || 0}`);
    console.log(`  - Users: ${data.users?.length || 0}`);
    console.log(`  - Profiles: ${data.profiles?.length || 0}`);
    console.log(`  - Topics: ${data.topics?.length || 0}`);
    console.log(`  - Questions: ${data.questions?.length || 0}`);
    console.log(`  - Quiz Sessions: ${data.quiz_sessions?.length || 0}`);
    console.log(`  - User Answers: ${data.user_answers?.length || 0}`);
    console.log(`  - Badge Types: ${data.badge_types?.length || 0}`);
    console.log(`  - Badges: ${data.badges?.length || 0}`);
    console.log(`  - Trophies: ${data.trophies?.length || 0}`);
    console.log(`  - Challenges: ${data.challenges?.length || 0}`);
    console.log(`  - User Challenges: ${data.user_challenges?.length || 0}`);
    console.log(`  - User Badges: ${data.user_badges?.length || 0}`);
    console.log(`  - User Trophies: ${data.user_trophies?.length || 0}`);
    console.log(`  - Sessions: ${data.sessions?.length || 0}`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
}

// Execute the import if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importData()
    .then(() => {
      console.log('Import completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importData };