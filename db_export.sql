-- PostgreSQL Database Export
-- Generated on: 2025-09-18T11:09:45.700Z
-- 

SET session_replication_role = replica;

-- Table: admin_sessions (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "admin_sessions" (
  "sid" CHARACTER VARYING NOT NULL,
  "sess" JSONB NOT NULL,
  "expire" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("sid");


-- Table: admin_users (3 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "email" CHARACTER VARYING NOT NULL,
  "password" CHARACTER VARYING NOT NULL,
  "first_name" CHARACTER VARYING,
  "last_name" CHARACTER VARYING,
  "role" CHARACTER VARYING DEFAULT 'admin'::character varying,
  "is_active" BOOLEAN DEFAULT true,
  "last_login_at" TIMESTAMP WITHOUT TIME ZONE,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "admin_users" ("id", "email", "password", "first_name", "last_name", "role", "is_active", "last_login_at", "created_at", "updated_at") VALUES
  ('4938b6f3-3af2-434c-b39a-192af2ad0abc', 'dailysparks@admin.com', 'a7465e1cf532d592693067c80f8a1c0849c8df6dbb4c09f79d212fcdc9429943540bb1c69329c600e4b970c3861f85939549821da01393ea13afc5d1d84d447b.6c5044e024d5b4363f6d6a2fd071a4ee', 'Daily', 'Sparks Admin', 'super_admin', TRUE, '2025-09-11T11:19:38.495Z', '2025-09-09T07:01:16.129Z', '2025-09-11T11:19:38.495Z'),
  ('a44795f9-d211-4f77-89f1-0beef05a888f', 'temp-admin@dailysparks.com', '6e014e0a6feb28f3cedbfc017c15ef54b4fb5a781a2c9000fa8846e67853dafbe084fe9ad3e283ad2594adbda5d83c76f5a3eb92439bc68bc14241b42cf16e31.dc68c4ad9633f778a874a6dc126747d9', 'Temp', 'Admin', 'admin', TRUE, '2025-09-16T13:59:45.286Z', '2025-09-16T13:59:38.577Z', '2025-09-16T13:59:45.286Z'),
  ('6c77ade6-8784-4a33-a73c-11fb58d066ac', 'admin@dailysparks.com', '2b3cba30f0f51cd0bd9990bd32e150d36fe28e3c35ba1936ca34e0985aeb0b5a0790642059259d0c3425dc6eb4421377c53f477dc281f68fa93bef8b11278931.a478db7120bf47fe7bd843f66b6d9abb', 'Admin', 'User', 'super_admin', TRUE, '2025-09-16T14:00:17.314Z', '2025-09-02T17:22:39.670Z', '2025-09-16T14:00:17.314Z');

ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");


-- Table: badge_types (8 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "badge_types" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "badge_types" ("id", "title", "description", "created_at") VALUES
  ('spark-badge-type', 'Spark Badge', 'Badges for earning sparks', '2025-09-09T06:31:40.753Z'),
  ('streak-badge-type', 'Streak Badge', 'Badges for maintaining streaks', '2025-09-09T06:31:40.808Z'),
  ('weekly-badge-type', 'Weekly Badge', 'Badges for weekly achievements', '2025-09-09T06:31:40.855Z'),
  ('daily-badge-type', 'Daily Badge', 'Badges for daily achievements', '2025-09-09T06:31:40.901Z'),
  ('spark-type', 'Spark Badges', 'Badges earned through collecting sparks', '2025-09-09T06:31:40.947Z'),
  ('streak-type', 'Streak Badges', 'Badges earned through maintaining streaks', '2025-09-09T06:31:40.993Z'),
  ('achievement-type', 'Achievement Badges', 'Special achievement badges', '2025-09-09T06:31:41.040Z'),
  ('daily-type', 'Daily Badges', 'Daily activity badges', '2025-09-09T06:31:41.085Z');

ALTER TABLE "badge_types" ADD CONSTRAINT "badge_types_pkey" PRIMARY KEY ("id");


-- Table: badges (7 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "badges" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "sparks" INTEGER,
  "icon" CHARACTER VARYING,
  "badge_type_id" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "badges" ("id", "title", "description", "sparks", "icon", "badge_type_id", "created_at") VALUES
  ('spark-collector', 'Spark Collector', 'Earned 100 sparks', 10, '⚡', 'spark-badge-type', '2025-09-09T06:31:41.132Z'),
  ('streak-warrior', 'Streak Warrior', 'Maintained 7-day streak', 20, '🔥', 'streak-badge-type', '2025-09-09T06:31:41.182Z'),
  ('daily-fire', 'Daily Fire Badge', 'Earned 50 sparks in a single day', 25, '🔥', 'daily-badge-type', '2025-09-09T06:31:41.229Z'),
  ('quiz-master', 'Quiz Master', 'Completed 10 quizzes', 30, '🏆', 'spark-badge-type', '2025-09-09T06:31:41.276Z'),
  ('spark-badge', 'Spark Collector', 'Earned by collecting sparks', 100, '⚡', 'spark-type', '2025-09-09T06:31:41.322Z'),
  ('streak-badge', 'Streak Master', 'Earned by maintaining learning streaks', 150, '🔥', 'streak-type', '2025-09-09T06:31:41.369Z'),
  ('weekly-warrior', 'Weekly Warrior', 'Earned by maintaining top 5 rank for 3 days', 300, '⚔️', 'achievement-type', '2025-09-09T06:31:41.415Z');

ALTER TABLE "badges" ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");


-- Table: challenges (5 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "challenges" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "sparks" INTEGER DEFAULT 0,
  "streaks" INTEGER DEFAULT 0,
  "badge_id" CHARACTER VARYING,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "challenges" ("id", "title", "description", "sparks", "streaks", "badge_id", "is_active", "created_at", "updated_at") VALUES
  ('daily-50-sparks', 'Daily Spark Hunter', 'Earn 50 sparks today', 10, 1, 'daily-fire', TRUE, '2025-09-09T06:31:41.620Z', '2025-09-09T06:31:41.620Z'),
  ('spark-collector-100', 'Spark Collector Challenge', 'Earn 100 total sparks', 50, 0, 'spark-collector', TRUE, '2025-09-09T06:31:41.670Z', '2025-09-09T06:31:41.670Z'),
  ('spark-collection', 'Collect 1000 sparks', 'Accumulate 1000 total sparks from quizzes', 300, 0, 'spark-badge', TRUE, '2025-09-09T06:31:41.718Z', '2025-09-09T06:31:41.718Z'),
  ('weekly-top5', 'Weekly Champion', 'Maintain Top 5 rank for 3 days', 100, 5, 'weekly-warrior', FALSE, '2025-09-09T06:31:41.764Z', '2025-09-09T06:31:41.764Z'),
  ('quiz-streak-7', 'Quiz Streak Master', 'Complete quizzes for 7 consecutive days', 75, 7, 'streak-warrior', FALSE, '2025-09-09T06:31:41.810Z', '2025-09-09T06:31:41.810Z');

ALTER TABLE "challenges" ADD CONSTRAINT "challenges_pkey" PRIMARY KEY ("id");


-- Table: credit_transactions (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "type" CHARACTER VARYING NOT NULL,
  "amount" NUMERIC(10,2) NOT NULL,
  "description" TEXT,
  "payment_transaction_id" CHARACTER VARYING,
  "balance_before" NUMERIC(10,2) NOT NULL,
  "balance_after" NUMERIC(10,2) NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id");


-- Table: daily_challenges (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "daily_challenges" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "date" CHARACTER VARYING NOT NULL,
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT NOT NULL,
  "target_value" INTEGER NOT NULL,
  "sparks_reward" INTEGER DEFAULT 200,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id");


-- Table: enhanced_quiz_sessions (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "enhanced_quiz_sessions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "quiz_id" CHARACTER VARYING NOT NULL,
  "user_id" CHARACTER VARYING NOT NULL,
  "profile_id" CHARACTER VARYING NOT NULL,
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "level_id" CHARACTER VARYING NOT NULL,
  "subject_id" CHARACTER VARYING NOT NULL,
  "quiz_questions" JSONB NOT NULL,
  "start_time" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "end_time" TIMESTAMP WITHOUT TIME ZONE,
  "total_questions" INTEGER NOT NULL,
  "correct_answers" INTEGER DEFAULT 0,
  "total_marks" INTEGER DEFAULT 0,
  "marks_obtained" INTEGER DEFAULT 0,
  "sparks_earned" INTEGER DEFAULT 0,
  "accuracy_percentage" INTEGER DEFAULT 0,
  "time_spent" INTEGER,
  "completed" BOOLEAN DEFAULT false,
  "can_retake" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "enhanced_quiz_sessions" ADD CONSTRAINT "enhanced_quiz_sessions_pkey" PRIMARY KEY ("id");


-- Table: examination_systems (3 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "examination_systems" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "name" CHARACTER VARYING NOT NULL,
  "code" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "country" CHARACTER VARYING,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "examination_systems" ("id", "name", "code", "description", "country", "is_active", "created_at") VALUES
  ('bde2015e-8e30-4460-ad2b-c79837d9438b', 'Kenya Certificate of Secondary Education', 'KCSE', 'The national secondary school leaving examination in Kenya', 'Kenya', TRUE, '2025-09-09T06:28:37.711Z'),
  ('3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'International General Certificate of Secondary Education', 'IGCSE', 'International qualification for secondary school students', 'International', TRUE, '2025-09-09T06:28:37.769Z'),
  ('55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Kenya Primary School Education Assessment', 'KPSEA', 'Primary school assessment system in Kenya', 'Kenya', TRUE, '2025-09-09T06:28:37.814Z');

ALTER TABLE "examination_systems" ADD CONSTRAINT "examination_systems_pkey" PRIMARY KEY ("id");


-- Table: general_settings (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "general_settings" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "platform_name" CHARACTER VARYING NOT NULL DEFAULT 'Daily Sparks'::character varying,
  "tagline" CHARACTER VARYING DEFAULT 'TikTok Simple, Harvard Smart'::character varying,
  "primary_color" CHARACTER VARYING DEFAULT '#3b82f6'::character varying,
  "secondary_color" CHARACTER VARYING DEFAULT '#1e40af'::character varying,
  "accent_color" CHARACTER VARYING DEFAULT '#f59e0b'::character varying,
  "logo_url" CHARACTER VARYING,
  "favicon_url" CHARACTER VARYING,
  "support_email" CHARACTER VARYING DEFAULT 'support@dailysparks.com'::character varying,
  "maintenance_mode" BOOLEAN DEFAULT false,
  "max_users" INTEGER DEFAULT 10000,
  "timezone" CHARACTER VARYING DEFAULT 'Africa/Nairobi'::character varying,
  "language" CHARACTER VARYING DEFAULT 'en'::character varying,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_by" CHARACTER VARYING
);

INSERT INTO "general_settings" ("id", "platform_name", "tagline", "primary_color", "secondary_color", "accent_color", "logo_url", "favicon_url", "support_email", "maintenance_mode", "max_users", "timezone", "language", "updated_at", "updated_by") VALUES
  ('c276867c-ee8c-424a-98b7-2a887a535d01', 'Daily Sparks', 'TikTok Simple, Harvard Smart', '#3b82f6', '#1e40af', '#f59e0b', NULL, NULL, 'support@dailysparks.com', FALSE, 10000, 'Africa/Nairobi', 'en', '2025-09-11T12:01:10.129Z', NULL);

ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_pkey" PRIMARY KEY ("id");


-- Table: levels (15 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "levels" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "levels" ("id", "title", "description", "examination_system_id", "order", "is_active", "created_at") VALUES
  ('bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Form 1', 'First year of secondary education', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 1, TRUE, '2025-09-09T06:28:37.859Z'),
  ('60190057-a240-4429-b2a5-f770958d3865', 'Form 2', 'Second year of secondary education', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 2, TRUE, '2025-09-09T06:28:37.909Z'),
  ('c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'Form 3', 'Third year of secondary education', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 3, TRUE, '2025-09-09T06:28:37.954Z'),
  ('9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'Form 4', 'Final year of secondary education', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 4, TRUE, '2025-09-09T06:28:37.998Z'),
  ('fed98955-8ee2-4f34-8880-ebbfef53fc99', 'Year 9', 'First year of IGCSE preparation', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 1, TRUE, '2025-09-09T06:28:38.042Z'),
  ('be8dd1d3-637d-412a-b92b-62d7a16bca3f', 'Year 10', 'Second year of IGCSE preparation', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 2, TRUE, '2025-09-09T06:28:38.086Z'),
  ('22548bb2-08e0-4569-8830-13aa16fe7051', 'Year 11', 'IGCSE examination year', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 3, TRUE, '2025-09-09T06:28:38.131Z'),
  ('bdc31e7b-582f-4555-9c29-2f29842e6082', 'Grade 1', 'First grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 1, TRUE, '2025-09-09T06:28:38.174Z'),
  ('2f073f7b-a729-4323-8066-f785856eb5f7', 'Grade 2', 'Second grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 2, TRUE, '2025-09-09T06:28:38.219Z'),
  ('3cfce747-a42a-4665-aeb2-c09068b2ba8b', 'Grade 3', 'Third grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 3, TRUE, '2025-09-09T06:28:38.263Z'),
  ('cfe56c5d-f225-4364-8c8f-683e620bff94', 'Grade 4', 'Fourth grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 4, TRUE, '2025-09-09T06:28:38.305Z'),
  ('800f5d94-0e11-430e-8d7c-f37f0ad97570', 'Grade 5', 'Fifth grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 5, TRUE, '2025-09-09T06:28:38.351Z'),
  ('ea00b810-db3c-4e6c-9d95-a675256386a3', 'Grade 6', 'Sixth grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 6, TRUE, '2025-09-09T06:28:38.394Z'),
  ('3775509e-6274-4bb7-a08a-50cf744df1ea', 'Grade 7', 'Seventh grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 7, TRUE, '2025-09-09T06:28:38.438Z'),
  ('5b4c9281-b003-403c-b62e-e69598ef6cbd', 'Grade 8', 'Final grade of primary education', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 8, TRUE, '2025-09-09T06:28:38.482Z');

ALTER TABLE "levels" ADD CONSTRAINT "levels_pkey" PRIMARY KEY ("id");


-- Table: notification_settings (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "notification_settings" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "email_notifications_enabled" BOOLEAN DEFAULT true,
  "daily_reminder_enabled" BOOLEAN DEFAULT true,
  "daily_reminder_time" CHARACTER VARYING DEFAULT '18:00'::character varying,
  "streak_reminder_enabled" BOOLEAN DEFAULT true,
  "achievement_notifications_enabled" BOOLEAN DEFAULT true,
  "leaderboard_updates_enabled" BOOLEAN DEFAULT true,
  "weekly_progress_report_enabled" BOOLEAN DEFAULT true,
  "weekly_progress_report_day" INTEGER DEFAULT 0,
  "challenge_notifications_enabled" BOOLEAN DEFAULT true,
  "spark_boost_notifications_enabled" BOOLEAN DEFAULT true,
  "maintenance_notifications_enabled" BOOLEAN DEFAULT true,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_by" CHARACTER VARYING
);

INSERT INTO "notification_settings" ("id", "email_notifications_enabled", "daily_reminder_enabled", "daily_reminder_time", "streak_reminder_enabled", "achievement_notifications_enabled", "leaderboard_updates_enabled", "weekly_progress_report_enabled", "weekly_progress_report_day", "challenge_notifications_enabled", "spark_boost_notifications_enabled", "maintenance_notifications_enabled", "updated_at", "updated_by") VALUES
  ('9f982939-e57b-470a-9bce-c69be557eefa', TRUE, TRUE, '18:00', TRUE, TRUE, TRUE, TRUE, 0, TRUE, TRUE, TRUE, '2025-09-11T12:01:10.543Z', NULL);

ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id");


-- Table: password_reset_tokens (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "email" CHARACTER VARYING NOT NULL,
  "token" CHARACTER VARYING NOT NULL,
  "expires_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "password_reset_tokens" ("id", "email", "token", "expires_at", "created_at") VALUES
  ('1dee3191-492e-43c5-9793-dcdfb858eea5', 'joemaina180@gmail.com', '9742a7cb-cc53-4bf5-a559-414654982992', '2025-09-11T12:03:24.031Z', '2025-09-11T11:03:24.097Z');

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");


-- Table: payment_transactions (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "payment_transactions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "type" CHARACTER VARYING NOT NULL,
  "amount" NUMERIC(10,2) NOT NULL,
  "currency" CHARACTER VARYING DEFAULT 'KES'::character varying,
  "status" CHARACTER VARYING NOT NULL DEFAULT 'pending'::character varying,
  "description" TEXT,
  "plan_id" CHARACTER VARYING,
  "paystack_reference" CHARACTER VARYING,
  "paystack_transaction_id" CHARACTER VARYING,
  "subscription_id" CHARACTER VARYING,
  "metadata" JSONB,
  "processed_at" TIMESTAMP WITHOUT TIME ZONE,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "payment_transactions" ("id", "user_id", "type", "amount", "currency", "status", "description", "plan_id", "paystack_reference", "paystack_transaction_id", "subscription_id", "metadata", "processed_at", "created_at") VALUES
  ('99fa9f2d-dbe6-4c06-aabe-b9149ef2b557', 'd87e114d-5958-4ba3-989c-0018fc506604', 'subscription', '6.00', 'USD', 'success', 'Subscription: Basic Plan (monthly)', '1', 'DS_1758097577436_99fa9f2d-dbe6-4c06-aabe-b9149ef2b557', NULL, NULL, '{"billingCycle":"monthly"}', '2025-09-17T08:26:32.238Z', '2025-09-17T08:26:18.202Z');

ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");


-- Table: profiles (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "level_id" CHARACTER VARYING NOT NULL,
  "current_term" CHARACTER VARYING DEFAULT 'Term 1'::character varying,
  "sparks" INTEGER DEFAULT 0,
  "streak" INTEGER DEFAULT 0,
  "current_streak" INTEGER DEFAULT 0,
  "longest_streak" INTEGER DEFAULT 0,
  "rank" INTEGER,
  "last_quiz_date" TIMESTAMP WITHOUT TIME ZONE,
  "last_activity" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "profiles" ("id", "user_id", "examination_system_id", "level_id", "current_term", "sparks", "streak", "current_streak", "longest_streak", "rank", "last_quiz_date", "last_activity", "is_active", "created_at", "updated_at") VALUES
  ('2f53acda-72bf-479e-9e83-c2683a250026', 'd87e114d-5958-4ba3-989c-0018fc506604', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'Term 1', 0, 0, 0, 0, NULL, NULL, '2025-09-16T13:54:15.503Z', TRUE, '2025-09-16T13:54:15.503Z', '2025-09-16T13:54:15.503Z');

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


-- Table: question_types (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "question_types" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "code" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "question_types" ADD CONSTRAINT "question_types_pkey" PRIMARY KEY ("id");


-- Table: questions (91 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "questions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "topic_id" CHARACTER VARYING,
  "question_text" TEXT NOT NULL,
  "option_a" TEXT NOT NULL,
  "option_b" TEXT NOT NULL,
  "option_c" TEXT NOT NULL,
  "option_d" TEXT NOT NULL,
  "correct_answer" CHARACTER VARYING NOT NULL,
  "explanation" TEXT,
  "difficulty" CHARACTER VARYING NOT NULL DEFAULT 'medium'::character varying,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "questions" ("id", "topic_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation", "difficulty", "created_at") VALUES
  ('906a1f63-48da-41ae-88a0-20436f5bfdbd', NULL, 'What is the SI unit of force?', 'Newton', 'Joule', 'Watt', 'Pascal', 'A', 'The SI unit of force is the Newton, which is defined as the force required to accelerate a one-kilogram mass by one meter per second squared.', 'easy', '2025-09-09T06:29:32.036Z'),
  ('87445cb9-db0d-4bbf-89ce-0e6312872d00', NULL, 'Which of the following is a vector quantity?', 'Mass', 'Speed', 'Velocity', 'Temperature', 'C', 'Velocity is a vector quantity because it has both magnitude and direction, unlike speed which only has magnitude.', 'easy', '2025-09-09T06:29:32.087Z'),
  ('5f683329-802e-4766-8ad3-4dc0cf6ccf7f', NULL, 'What is the primary purpose of a fuse in an electrical circuit?', 'To increase the voltage', 'To reduce the resistance', 'To prevent excessive current flow', 'To increase the current', 'C', 'A fuse is used to protect an electrical circuit by breaking the circuit if the current exceeds a safe level, preventing overheating and potential fires.', 'easy', '2025-09-09T06:29:32.135Z'),
  ('2b1e9b40-ecde-4b6b-846c-34fb02cf0290', NULL, 'Which of the following instruments is used to measure atmospheric pressure?', 'Thermometer', 'Barometer', 'Hygrometer', 'Anemometer', 'B', 'A barometer is an instrument used to measure atmospheric pressure, which is essential for weather forecasting and altitude measurement.', 'easy', '2025-09-09T06:29:32.182Z'),
  ('43783404-3eb3-48d9-b9d3-64e44ba6c218', NULL, 'What type of image is formed by a plane mirror?', 'Real and inverted', 'Virtual and inverted', 'Real and upright', 'Virtual and upright', 'D', 'A plane mirror forms a virtual and upright image that is laterally inverted. Virtual images cannot be projected on a screen.', 'easy', '2025-09-09T06:29:32.229Z'),
  ('5ba2f696-a954-443e-bbb5-bc3ef359eb69', NULL, 'Which of the following is a non-renewable energy source?', 'Solar energy', 'Wind energy', 'Coal', 'Geothermal energy', 'C', 'Coal is a non-renewable energy source because it is formed from fossilized organic matter and takes millions of years to form, unlike renewable sources like solar and wind.', 'easy', '2025-09-09T06:29:32.277Z'),
  ('628fa8ad-031a-4d1b-a887-a400ab3583fc', NULL, 'Which principle explains why a ship floats on water?', 'Archimedes'' Principle', 'Pascal''s Principle', 'Bernoulli''s Principle', 'Newton''s First Law', 'A', 'Archimedes'' Principle states that an object submerged in fluid experiences a buoyant force equal to the weight of the fluid displaced, allowing a ship to float.', 'easy', '2025-09-09T06:29:32.325Z'),
  ('3185bc0b-fef0-499d-ac70-6bdd33f5a4f2', NULL, 'What is the main reason for using copper in electrical cables?', 'High density', 'High resistance', 'High conductivity', 'High cost', 'C', 'Copper is used in electrical cables primarily because of its high electrical conductivity, allowing efficient transmission of electricity.', 'easy', '2025-09-09T06:29:32.372Z'),
  ('042996e4-12eb-4bdd-ba7a-065cc1cd6701', NULL, 'What does an ammeter measure?', 'Voltage', 'Current', 'Resistance', 'Temperature', 'B', 'An ammeter is an instrument used to measure the electric current in a circuit, typically in amperes.', 'easy', '2025-09-09T06:29:32.422Z'),
  ('3821bdcc-593c-466d-8aae-111949c5dfc8', NULL, 'Which of the following is not a property of light?', 'Refraction', 'Diffusion', 'Diffraction', 'Reflection', 'B', 'Diffusion is not a property of light. It is the process of spreading something more widely, typically in gases or fluids. Light exhibits refraction, diffraction, and reflection.', 'easy', '2025-09-09T06:29:32.477Z'),
  ('d3a9c7cf-b026-4f41-b6ef-b7888075b5d0', NULL, 'What is the effect of increasing the length of a pendulum on its period?', 'Period decreases', 'Period increases', 'Period remains the same', 'Period doubles', 'B', 'The period of a pendulum is directly proportional to the square root of its length. Increasing the length increases the period.', 'medium', '2025-09-09T06:29:32.525Z'),
  ('3c029c00-e59e-4835-9947-1b35cc0ce460', NULL, 'Which law explains the relationship between current, voltage, and resistance?', 'Ohm''s Law', 'Kirchhoff''s Law', 'Coulomb''s Law', 'Faraday''s Law', 'A', 'Ohm''s Law states that the current through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to the resistance.', 'medium', '2025-09-09T06:29:32.571Z'),
  ('6995041b-f8b7-4a48-8a5d-4a82c1db188c', NULL, 'What is the acceleration due to gravity on the surface of the Earth?', '9.8 m/s²', '6.67 m/s²', '10.8 m/s²', '5.5 m/s²', 'A', 'The standard acceleration due to gravity on Earth''s surface is approximately 9.8 meters per second squared.', 'medium', '2025-09-09T06:29:32.619Z'),
  ('604f00c4-7609-4939-91ba-4163a023c327', NULL, 'What happens to the pressure of a gas if its volume is reduced while the temperature remains constant?', 'Pressure decreases', 'Pressure increases', 'Pressure remains the same', 'Pressure doubles', 'B', 'According to Boyle''s Law, the pressure of a gas is inversely proportional to its volume when temperature is constant. Therefore, reducing the volume increases the pressure.', 'medium', '2025-09-09T06:29:32.666Z'),
  ('cd64933c-e41b-4909-a952-e369d9d3d6f0', NULL, 'Which of the following is not a longitudinal wave?', 'Sound wave', 'Seismic P-wave', 'Water wave', 'Ultrasound wave', 'C', 'Water waves are not purely longitudinal; they are a combination of longitudinal and transverse motions. Longitudinal waves include sound and seismic P-waves.', 'medium', '2025-09-09T06:29:32.714Z'),
  ('c999f4ad-be4f-473f-91bc-8d637e238a90', NULL, 'What is the primary function of a transformer?', 'To increase resistance', 'To convert DC to AC', 'To change voltage levels', 'To store electrical energy', 'C', 'A transformer is used to change the voltage levels of alternating current (AC) in power systems, either stepping up or stepping down the voltage.', 'medium', '2025-09-09T06:29:32.760Z'),
  ('6ca1daa8-5724-4392-8a31-8e875d72c2b9', NULL, 'Which of the following best describes the term ''temperature''?', 'The amount of heat energy in a substance', 'The average kinetic energy of particles in a substance', 'The total energy of all particles in a substance', 'The potential energy of particles in a substance', 'B', 'Temperature is a measure of the average kinetic energy of the particles in a substance. It indicates how hot or cold the substance is.', 'medium', '2025-09-09T06:29:32.808Z'),
  ('71d2d447-a038-44e1-b80f-872e0a534005', NULL, 'Which of the following materials is the best conductor of electricity?', 'Rubber', 'Glass', 'Copper', 'Plastic', 'C', 'Copper is a metal with high electrical conductivity, making it an excellent conductor of electricity, unlike insulators like rubber, glass, and plastic.', 'medium', '2025-09-09T06:29:32.856Z'),
  ('39b0aaae-238b-42c0-8b2f-832f9645548e', NULL, 'What determines the pitch of a sound?', 'Amplitude', 'Frequency', 'Speed', 'Wavelength', 'B', 'The pitch of a sound is determined by its frequency. Higher frequency sounds have a higher pitch, while lower frequency sounds have a lower pitch.', 'medium', '2025-09-09T06:29:32.904Z'),
  ('e85d3dae-5c0f-4268-9075-b59848e1e98a', NULL, 'Which of the following best describes inertia?', 'The ability of an object to resist changes in motion', 'The force exerted by a moving object', 'The speed of an object in free fall', 'The energy stored in an object', 'A', 'Inertia is the property of an object to resist changes in its state of motion. It is directly related to the mass of the object.', 'medium', '2025-09-09T06:29:32.951Z'),
  ('58496c6b-cee7-406c-b467-7b8df73603ff', NULL, 'Which process describes the transfer of heat through a solid?', 'Convection', 'Radiation', 'Conduction', 'Evaporation', 'C', 'Conduction is the transfer of heat through a solid material where heat is passed from particle to particle through direct contact.', 'medium', '2025-09-09T06:29:32.999Z'),
  ('e2adcdd5-97b0-446c-9206-b6d10d96fe50', NULL, 'What occurs to light as it passes through a prism?', 'It absorbs', 'It refracts', 'It reflects', 'It diffuses', 'B', 'Light refracts, or bends, as it passes through a prism, resulting in the dispersion of white light into its constituent colors, forming a spectrum.', 'medium', '2025-09-09T06:29:33.047Z'),
  ('ae847339-46f1-46fa-8064-53d796c466f2', NULL, 'Which of the following is not an example of a mechanical wave?', 'Sound wave', 'Seismic wave', 'Light wave', 'Water wave', 'C', 'Light waves are electromagnetic waves, not mechanical. Mechanical waves require a medium to travel through, such as sound, seismic, and water waves.', 'medium', '2025-09-09T06:29:33.095Z'),
  ('ecf916d1-dcee-4d2d-bbf4-9daa4af61bf6', NULL, 'What is the primary cause of tides on Earth?', 'The Earth''s rotation', 'The gravitational pull of the Moon', 'The gravitational pull of the Sun', 'The wind patterns', 'B', 'Tides are primarily caused by the gravitational pull of the Moon on the Earth''s oceans, with the Sun contributing to a lesser extent.', 'medium', '2025-09-09T06:29:33.146Z'),
  ('f3d0261a-aa3d-4f82-a648-0c1ad0906740', NULL, 'What is the term for the change in frequency of a wave in relation to an observer moving relative to the source?', 'Doppler Effect', 'Refraction', 'Diffraction', 'Interference', 'A', 'The Doppler Effect refers to the change in frequency or wavelength of a wave in relation to an observer who is moving relative to the wave source.', 'medium', '2025-09-09T06:29:33.193Z'),
  ('a6841427-d847-4c45-8ed0-4725eee02db4', NULL, 'How does the speed of sound in air compare to its speed in water?', 'Faster in air', 'Faster in water', 'Same speed', 'Depends on temperature', 'B', 'The speed of sound is faster in water than in air because water is denser, allowing sound waves to travel more efficiently between the molecules.', 'medium', '2025-09-09T06:29:33.240Z'),
  ('10c17084-8bf7-4163-b21a-219f583cc692', NULL, 'Which of the following phenomena demonstrates that light can behave as a wave?', 'Photoelectric effect', 'Reflection', 'Interference', 'Refraction', 'C', 'Interference is a wave phenomenon where two or more light waves superpose to form a resultant wave, demonstrating the wave nature of light.', 'medium', '2025-09-09T06:29:33.288Z'),
  ('785a89bd-a975-4a5e-b31d-c49a5290ab61', NULL, 'What type of mirror can be used to focus light to a single point?', 'Plane mirror', 'Convex mirror', 'Concave mirror', 'Spherical mirror', 'C', 'A concave mirror can focus parallel rays of light to a single point known as the focal point. This property is used in devices like telescopes.', 'medium', '2025-09-09T06:29:33.335Z'),
  ('15bcda72-e05f-470e-9831-cce9887e9afd', NULL, 'Which of the following best describes the term ''work'' in physics?', 'The energy transferred by a force over a distance', 'The power expended over time', 'The pressure applied over an area', 'The heat transferred between objects', 'A', 'In physics, work is defined as the energy transferred to or from an object via the application of force along a displacement.', 'medium', '2025-09-09T06:29:33.383Z'),
  ('cd287984-8a67-41de-8f15-15b2b6ba9fac', NULL, 'What is the term for the bending of waves around obstacles and openings?', 'Reflection', 'Refraction', 'Diffraction', 'Interference', 'C', 'Diffraction is the bending of waves around the corners of an obstacle or through an aperture, which is a property of wave behavior.', 'medium', '2025-09-09T06:29:33.432Z'),
  ('766aed51-9e95-4c0f-a663-8d88ea8f81da', NULL, 'Which of the following is a unit of force?', 'Newton', 'Pascal', 'Joule', 'Watt', 'A', 'The Newton is the unit of force in the International System of Units (SI). One Newton is the force required to accelerate one kilogram of mass at the rate of one meter per second squared.', 'easy', '2025-09-09T06:29:33.479Z'),
  ('02b6b3c7-be6f-4583-b13e-7bf5ac02d1e3', NULL, 'What is the primary source of energy for the Earth?', 'The Sun', 'Wind', 'Geothermal energy', 'Nuclear energy', 'A', 'The Sun is the primary source of energy for Earth. It provides the energy necessary for climate and weather systems, and supports life through photosynthesis in plants.', 'easy', '2025-09-09T06:29:33.544Z'),
  ('910ee492-a876-4c67-9e3c-f9a756e4e7e6', NULL, 'Which of the following instruments is used to measure mass?', 'Spring balance', 'Thermometer', 'Stopwatch', 'Beam balance', 'D', 'A beam balance is used to measure mass by comparing the mass of an object with known masses. It provides a direct measure of an object''s mass.', 'easy', '2025-09-09T06:29:33.596Z'),
  ('d2d050a3-86aa-442f-a48a-04defd5405ea', NULL, 'In which state of matter do particles have the most energy?', 'Solid', 'Liquid', 'Gas', 'Plasma', 'D', 'Plasma, often referred to as the fourth state of matter, consists of highly energized particles that have the ability to conduct electricity and respond to magnetic fields. It has more energy than solids, liquids, or gases.', 'medium', '2025-09-09T06:29:33.644Z'),
  ('0857c498-c9e3-4e85-b8e0-bbb691cb91be', NULL, 'What is the term for the transfer of heat through direct contact?', 'Radiation', 'Convection', 'Conduction', 'Evaporation', 'C', 'Conduction is the process of heat transfer through direct contact of molecules within a substance. It occurs when heat is transferred from a hotter part to a cooler part through molecules colliding.', 'easy', '2025-09-09T06:29:33.691Z'),
  ('702a1f02-1a08-42a3-9e46-ab6c936ba9b3', NULL, 'Which of the following physical quantities is a vector?', 'Mass', 'Temperature', 'Velocity', 'Energy', 'C', 'Velocity is a vector quantity because it has both magnitude and direction. In contrast, mass, temperature, and energy are scalar quantities with magnitude only.', 'medium', '2025-09-09T06:29:33.739Z'),
  ('d6f7c274-68e7-423c-b45a-5e908e742faa', NULL, 'Which of the following is the best conductor of electricity?', 'Copper', 'Wood', 'Glass', 'Rubber', 'A', 'Copper is a metal and is well known for its excellent electrical conductivity, which makes it widely used in electrical wiring.', 'medium', '2025-09-09T06:29:33.786Z'),
  ('b2aafe79-2690-4f38-985e-da73bc18432b', NULL, 'What is the acceleration due to gravity on Earth''s surface?', '9.8 m/s²', '8.9 m/s²', '10 m/s²', '9.2 m/s²', 'A', 'The standard acceleration due to gravity on Earth''s surface is approximately 9.8 m/s². This value is used in equations of motion and other calculations involving gravity.', 'easy', '2025-09-09T06:29:33.834Z'),
  ('feb0fdff-959a-4566-9cd0-72f3b422c853', NULL, 'Which of the following is not a renewable source of energy?', 'Solar energy', 'Wind energy', 'Coal', 'Hydroelectric power', 'C', 'Coal is a fossil fuel and is not renewable because it takes millions of years to form. Solar, wind, and hydroelectric power are renewable as they are naturally replenished.', 'medium', '2025-09-09T06:29:33.882Z'),
  ('232a3dc5-4bdb-4a00-bea3-a4a27883debe', NULL, 'Which property of a wave is measured in Hertz?', 'Frequency', 'Amplitude', 'Wavelength', 'Speed', 'A', 'Frequency is the number of cycles of a wave passing a point per unit time, measured in Hertz (Hz). One Hertz is equivalent to one cycle per second.', 'medium', '2025-09-09T06:29:33.929Z'),
  ('5b8c0bad-d42d-48ff-a1e1-feb62b2dd722', NULL, 'What is the term for materials that do not allow heat to pass through them easily?', 'Conductors', 'Insulators', 'Metalloids', 'Semiconductors', 'B', 'Insulators are materials that do not allow heat to pass through them easily. They are used to prevent heat loss or gain, such as in thermal insulation.', 'easy', '2025-09-09T06:29:33.978Z'),
  ('ff097d62-7db2-4f05-a6ac-a6a155c565e4', NULL, 'Which law explains why a boat moves forward when a person pushes water backward with a paddle?', 'Newton''s First Law', 'Newton''s Second Law', 'Newton''s Third Law', 'Law of Conservation of Energy', 'C', 'Newton''s Third Law states that for every action, there is an equal and opposite reaction. When the person pushes the water backward, the water pushes the boat forward with an equal force.', 'medium', '2025-09-09T06:29:34.025Z'),
  ('fe926186-f7bf-40fc-973e-41393f692729', NULL, 'Which of the following is the correct formula for calculating density?', 'Density = Mass × Volume', 'Density = Volume / Mass', 'Density = Mass / Volume', 'Density = Mass + Volume', 'C', 'Density is defined as mass per unit volume, and the formula is Density = Mass / Volume. It measures how much mass is contained in a given volume.', 'easy', '2025-09-09T06:29:34.071Z'),
  ('d56cc978-12ad-44a8-bcbf-57f7027f85dd', NULL, 'What is the term for the bending of light as it passes from one medium to another?', 'Reflection', 'Refraction', 'Diffraction', 'Interference', 'B', 'Refraction is the bending of light as it passes from one medium to another with a different density. This change in speed causes the light to change direction.', 'medium', '2025-09-09T06:29:34.119Z'),
  ('18e83416-148b-4334-a0ee-d1e445e5adae', NULL, 'Which of the following is an example of a non-contact force?', 'Friction', 'Tension', 'Magnetic force', 'Normal force', 'C', 'Magnetic force is a non-contact force because it acts at a distance without direct physical contact. It can attract or repel magnetic materials.', 'medium', '2025-09-09T06:29:34.167Z'),
  ('1ac04e8d-86ab-4b02-8c67-a979c8e2c821', NULL, 'Which of the following states that energy cannot be created or destroyed, only transformed?', 'Conservation of Mass', 'Conservation of Energy', 'Conservation of Momentum', 'Conservation of Charge', 'B', 'The Law of Conservation of Energy states that energy cannot be created or destroyed, only transformed from one form to another. The total energy in a closed system remains constant.', 'medium', '2025-09-09T06:29:34.215Z'),
  ('a2a32308-b8eb-4af7-ac53-b128fbced57e', NULL, 'Which of these devices converts electrical energy into mechanical energy?', 'Electric generator', 'Electric motor', 'Transformer', 'Battery', 'B', 'An electric motor converts electrical energy into mechanical energy, allowing it to do work, such as turning the blades of a fan.', 'medium', '2025-09-09T06:29:34.262Z'),
  ('0bc3876f-6bf2-4d8d-bf34-f9cf16820222', NULL, 'Which of the following is the correct unit for measuring power?', 'Joule', 'Newton', 'Watt', 'Pascal', 'C', 'Power is measured in Watts, which is equivalent to one Joule per second. It quantifies the rate at which work is done or energy is transferred.', 'easy', '2025-09-09T06:29:34.313Z'),
  ('45b8ed1a-6257-4e58-abbe-a9f2ba7bd125', NULL, 'Which phenomenon explains the increase in volume of a gas when its temperature is increased at constant pressure?', 'Boyle''s Law', 'Charles''s Law', 'Pascal''s Principle', 'Bernoulli''s Principle', 'B', 'Charles''s Law states that the volume of a gas is directly proportional to its temperature at constant pressure. As temperature increases, so does volume.', 'medium', '2025-09-09T06:29:34.359Z'),
  ('77829d6a-d2ea-42ec-85a6-83da1a779396', NULL, 'What is the term for the force that opposes the relative motion of two surfaces in contact?', 'Tension', 'Normal force', 'Friction', 'Centripetal force', 'C', 'Friction is the force that opposes the relative motion or tendency of such motion of two surfaces in contact. It acts parallel to the surfaces.', 'easy', '2025-09-09T06:29:34.407Z'),
  ('2b6d63ba-7fb5-4442-b276-52aa19855360', NULL, 'Which of the following elements is used in thermometers because it expands uniformly?', 'Water', 'Mercury', 'Alcohol', 'Oil', 'B', 'Mercury is used in thermometers because it expands uniformly with temperature changes, allowing for accurate measurements.', 'medium', '2025-09-09T06:29:34.454Z'),
  ('a8187ccc-ef7f-4d4e-b073-f79fc62c0307', NULL, 'What is the term for a material''s resistance to flow?', 'Density', 'Viscosity', 'Elasticity', 'Conductivity', 'B', 'Viscosity is a measure of a fluid''s resistance to flow. Higher viscosity means the fluid flows more slowly, like honey compared to water.', 'medium', '2025-09-09T06:29:34.501Z'),
  ('3696c833-ed4b-4769-9f5d-2fee43e7e6c3', NULL, 'Which of these particles is negatively charged?', 'Proton', 'Electron', 'Neutron', 'Photon', 'B', 'Electrons are negatively charged particles that orbit the nucleus of an atom. Protons are positively charged, while neutrons have no charge.', 'easy', '2025-09-09T06:29:34.550Z'),
  ('de685840-5c42-454c-9269-8e35178db100', NULL, 'What is the name of the point where the entire weight of an object appears to act?', 'Centre of gravity', 'Centre of mass', 'Equilibrium point', 'Centre of motion', 'A', 'The centre of gravity is the point where the entire weight of an object appears to act, and it is the balance point of the object.', 'medium', '2025-09-09T06:29:34.598Z'),
  ('1f9938df-2e86-498a-af59-94bfcefc0522', NULL, 'Which of the following is a scalar quantity?', 'Displacement', 'Force', 'Speed', 'Velocity', 'C', 'Speed is a scalar quantity because it only has magnitude and no direction, unlike velocity which is a vector quantity.', 'medium', '2025-09-09T06:29:34.645Z'),
  ('98cec6b0-ff89-44f8-9e4a-687822546139', NULL, 'What is the name of the process by which a liquid changes into a gas at its surface?', 'Boiling', 'Condensation', 'Evaporation', 'Sublimation', 'C', 'Evaporation is the process by which molecules at the surface of a liquid gain enough energy to become a gas. It occurs at temperatures below boiling point.', 'easy', '2025-09-09T06:29:34.694Z'),
  ('f21ca8a7-7ac2-4744-9f16-537f27dce602', NULL, 'Which of the following is not a form of electromagnetic radiation?', 'Sound waves', 'X-rays', 'Microwaves', 'Infrared', 'A', 'Sound waves are mechanical waves, not electromagnetic waves. Electromagnetic radiation includes X-rays, microwaves, and infrared.', 'medium', '2025-09-09T06:29:34.741Z'),
  ('0cb5e449-4d8c-43df-9fc1-4536c5ce4f53', NULL, 'Which force keeps the planets in orbit around the Sun?', 'Magnetic force', 'Electrostatic force', 'Gravitational force', 'Nuclear force', 'C', 'Gravitational force is the force of attraction between two masses. It is the force that keeps the planets in orbit around the Sun.', 'easy', '2025-09-09T06:29:34.789Z'),
  ('575a2033-8d12-47ae-9da8-c9ad6f83ff7f', NULL, 'What is the name of the device that measures atmospheric pressure?', 'Thermometer', 'Barometer', 'Ammeter', 'Voltmeter', 'B', 'A barometer is an instrument used to measure atmospheric pressure. It is commonly used in weather forecasting.', 'easy', '2025-09-09T06:29:34.837Z'),
  ('ea60932b-1cfd-42c2-b066-9f6f3e02f03d', NULL, 'What is the term for the force exerted by a fluid on an object moving through it?', 'Drag', 'Lift', 'Thrust', 'Buoyancy', 'A', 'Drag is the force exerted by a fluid (such as air or water) that opposes an object''s motion through the fluid. It is a form of friction.', 'medium', '2025-09-09T06:29:34.888Z'),
  ('54746047-aceb-4db3-9449-0861447025dc', NULL, 'Which of the following describes the tendency of an object to resist changes in its state of motion?', 'Inertia', 'Momentum', 'Force', 'Velocity', 'A', 'Inertia is the property of matter that causes it to resist changes in its state of motion. It depends on the mass of the object.', 'easy', '2025-09-09T06:29:34.937Z'),
  ('8a415d96-7b37-485f-80e4-4be0ed0cb198', NULL, 'Which of the following is an example of a scalar quantity?', 'Velocity', 'Force', 'Speed', 'Displacement', 'C', 'Speed is a scalar quantity because it only has magnitude and no direction, unlike velocity, force, and displacement which are vectors.', 'easy', '2025-09-09T06:29:34.985Z'),
  ('4e9d747f-cfae-4745-ba16-03b0df84377a', NULL, 'What is the SI unit of force?', 'Joule', 'Pascal', 'Newton', 'Watt', 'C', 'The SI unit of force is the Newton (N), named after Sir Isaac Newton in recognition of his work on classical mechanics.', 'easy', '2025-09-09T06:29:35.031Z'),
  ('34914c9d-599f-41f2-b3d4-5e2320f3bf60', NULL, 'Which of the following instruments is used to measure atmospheric pressure?', 'Thermometer', 'Barometer', 'Hygrometer', 'Anemometer', 'B', 'A barometer is used to measure atmospheric pressure. It can be used in weather forecasting to predict short-term changes in the weather.', 'easy', '2025-09-09T06:29:35.079Z'),
  ('2dfd2442-7452-46be-9e08-91944a7f8678', NULL, 'What is the primary purpose of a fuse in an electrical circuit?', 'To increase current flow', 'To decrease voltage', 'To protect against overcurrent', 'To conduct electricity', 'C', 'A fuse is a safety device used to protect an electrical circuit by breaking the connection if the current exceeds a safe level, thereby preventing overcurrent.', 'easy', '2025-09-09T06:29:35.129Z'),
  ('4f038f36-2a46-4b6b-8921-05b0c89457b9', NULL, 'Which one of the following is a renewable source of energy?', 'Coal', 'Natural gas', 'Solar energy', 'Nuclear energy', 'C', 'Solar energy is renewable because it is derived from the sun, which is a consistent and ongoing source of power.', 'easy', '2025-09-09T06:29:35.178Z'),
  ('f9f5b373-1038-4bff-9cfa-a7d14a6a87e3', NULL, 'What is the effect of increasing the temperature of a gas at constant volume?', 'The gas pressure decreases', 'The gas pressure remains constant', 'The gas pressure increases', 'The gas expands', 'C', 'According to Gay-Lussac''s law, the pressure of a gas increases with an increase in temperature if the volume remains constant.', 'medium', '2025-09-09T06:29:35.224Z'),
  ('7211fc0e-a54f-409b-b606-ff47f9199683', NULL, 'Which material is a good conductor of electricity?', 'Rubber', 'Glass', 'Copper', 'Wood', 'C', 'Copper is a good conductor of electricity due to its high electrical conductivity, making it commonly used in electrical wiring.', 'easy', '2025-09-09T06:29:35.272Z'),
  ('804fe0c3-a312-40b2-ba6a-bd3b7b7f24a6', NULL, 'In which of the following media does sound travel the fastest?', 'Air', 'Water', 'Iron', 'Vacuum', 'C', 'Sound travels fastest in solids like iron because the particles are closely packed, allowing sound waves to transmit more efficiently.', 'medium', '2025-09-09T06:29:35.320Z'),
  ('2926bdf3-e207-4130-bd34-50bb9371c120', NULL, 'Which law describes the relationship between the pressure and volume of a gas at constant temperature?', 'Boyle''s Law', 'Charles''s Law', 'Pascal''s Law', 'Newton''s Law', 'A', 'Boyle''s Law states that the pressure of a gas is inversely proportional to its volume at constant temperature.', 'medium', '2025-09-09T06:29:35.367Z'),
  ('435d4fb7-7cc7-43c7-99e4-1627ac26c669', NULL, 'What is the acceleration due to gravity on Earth?', '9.8 m/s', '9.8 m/s²', '10.8 m/s²', '9.8 km/s', 'B', 'The acceleration due to gravity on Earth is approximately 9.8 m/s², which is the rate at which objects accelerate towards the Earth when in free fall.', 'easy', '2025-09-09T06:29:35.415Z'),
  ('7df6c608-e485-46eb-b55d-94fd17f0e7f1', NULL, 'What is the term for the bending of light as it passes from one medium to another?', 'Reflection', 'Diffraction', 'Refraction', 'Dispersion', 'C', 'Refraction is the bending of light as it passes from one medium to another due to a change in its speed.', 'medium', '2025-09-09T06:29:35.463Z'),
  ('e1c3d908-c6b1-46fd-adbf-c53fd0e97df5', NULL, 'Which of the following is a characteristic of a wave?', 'Mass', 'Volume', 'Amplitude', 'Density', 'C', 'Amplitude is a characteristic of a wave that measures the maximum displacement of points on the wave from its rest position.', 'medium', '2025-09-09T06:29:35.510Z'),
  ('5e2fbb4f-bdc3-4ec0-b6bc-f03300da92d7', NULL, 'What type of image is formed by a plane mirror?', 'Real and inverted', 'Virtual and erect', 'Real and magnified', 'Virtual and inverted', 'B', 'A plane mirror forms a virtual and erect image that is the same size as the object.', 'easy', '2025-09-09T06:29:35.558Z'),
  ('fec2c389-4e1b-4f5d-9442-7e3e78b4578c', NULL, 'What is the principle behind the operation of a hydraulic press?', 'Archimedes'' Principle', 'Pascal''s Principle', 'Bernoulli''s Principle', 'Newton''s Third Law', 'B', 'Pascal''s Principle states that a change in pressure applied to a confined fluid is transmitted undiminished throughout the fluid, which is the principle behind hydraulic systems.', 'medium', '2025-09-09T06:29:35.606Z'),
  ('2e9a4b8a-2589-45ee-983d-a49e636404a4', NULL, 'What is the unit of electric current?', 'Volt', 'Ampere', 'Ohm', 'Watt', 'B', 'The unit of electric current is the Ampere (A), which measures the flow of electric charge.', 'easy', '2025-09-09T06:29:35.655Z'),
  ('61f77264-b66f-48a9-9312-fc6d74a1b385', NULL, 'Which of the following substances would float on water?', 'Iron', 'Aluminium', 'Ice', 'Copper', 'C', 'Ice floats on water because it is less dense than liquid water, due to the molecular structure of ice.', 'easy', '2025-09-09T06:29:35.703Z'),
  ('4333ad89-add8-43ac-be16-ff1e43e1217d', NULL, 'Which of the following devices converts chemical energy into electrical energy?', 'Transformer', 'Battery', 'Generator', 'Motor', 'B', 'A battery converts chemical energy into electrical energy through electrochemical reactions within its cells.', 'medium', '2025-09-09T06:29:35.750Z'),
  ('44014381-64b9-4fd7-9e51-32af5ff550e8', NULL, 'What is the speed of light in a vacuum?', '3 x 10^6 m/s', '3 x 10^8 m/s', '3 x 10^9 m/s', '3 x 10^7 m/s', 'B', 'The speed of light in a vacuum is approximately 3 x 10^8 meters per second, which is a fundamental constant of nature.', 'medium', '2025-09-09T06:29:35.798Z'),
  ('947cbbfa-aebe-4336-9f73-4f5ba8b5dd1d', NULL, 'What is the main factor that affects the pitch of a sound?', 'Amplitude', 'Frequency', 'Wavelength', 'Velocity', 'B', 'The pitch of a sound is determined by its frequency; higher frequencies correspond to higher pitches.', 'medium', '2025-09-09T06:29:35.845Z'),
  ('860ea11b-1098-4f73-9f75-b3b4e0c1c74c', NULL, 'Which of the following is not a thermometric property?', 'Volume of a gas', 'Resistance of a wire', 'Pressure of a gas', 'Mass of a liquid', 'D', 'Mass of a liquid is not a thermometric property; thermometric properties change with temperature and can be used to measure it, like volume, resistance, and pressure.', 'medium', '2025-09-09T06:29:35.893Z'),
  ('4008b23f-329a-4ae5-9837-89fbfcf495c7', NULL, 'Which type of lens is used to correct short-sightedness (myopia)?', 'Convex lens', 'Concave lens', 'Bifocal lens', 'Cylindrical lens', 'B', 'A concave lens is used to correct short-sightedness by diverging light rays before they reach the eye, enabling a proper focus on the retina.', 'medium', '2025-09-09T06:29:35.939Z'),
  ('ed21c922-da22-491b-82ae-3604dbc942e6', NULL, 'Which of the following is a property of all electromagnetic waves?', 'They require a medium to travel', 'They travel at the same speed in a vacuum', 'They are longitudinal waves', 'They have the same frequency', 'B', 'All electromagnetic waves travel at the same speed in a vacuum, which is the speed of light, approximately 3 x 10^8 m/s.', 'medium', '2025-09-09T06:29:35.986Z'),
  ('3457d795-eb85-4a1c-b14e-f68e60f732d2', NULL, 'What happens to the current in a series circuit if one of the components fails?', 'The current increases', 'The current decreases', 'The current stops', 'The current remains the same', 'C', 'In a series circuit, if one component fails, the entire circuit is broken, and the current stops flowing.', 'easy', '2025-09-09T06:29:36.034Z'),
  ('2236a154-9849-4b38-933a-f228e3326b12', NULL, 'Which of the following is not an effect of electric current?', 'Magnetic effect', 'Chemical effect', 'Thermal effect', 'Optical effect', 'D', 'Electric current can produce magnetic, chemical, and thermal effects, but not optical effects directly.', 'medium', '2025-09-09T06:29:36.081Z'),
  ('7e8a7e13-592d-4928-bae9-57455426d3fe', NULL, 'Which of the following phenomena demonstrates the wave nature of light?', 'Photoelectric effect', 'Interference', 'Emission spectra', 'Reflection', 'B', 'Interference is a phenomenon that demonstrates the wave nature of light, as it involves the superposition of light waves leading to regions of constructive and destructive interference.', 'medium', '2025-09-09T06:29:36.129Z'),
  ('0c2baa47-4f15-4056-b824-d4dd221c33d9', NULL, 'What is the name of the force that opposes the relative motion of two surfaces in contact?', 'Gravitational force', 'Normal force', 'Frictional force', 'Tension force', 'C', 'Frictional force is the force that opposes the relative motion or tendency of such motion of two surfaces in contact.', 'easy', '2025-09-09T06:29:36.177Z'),
  ('110ad20a-0391-4b96-96ae-e5ffe23327cc', NULL, 'Which component is used to store electrical energy in a circuit?', 'Resistor', 'Capacitor', 'Inductor', 'Diode', 'B', 'A capacitor is an electrical component used to store energy electrostatically in an electric field.', 'medium', '2025-09-09T06:29:36.225Z'),
  ('9830b148-3a59-4ccd-ac3b-2a9748fd5854', NULL, 'What is the function of a transformer in an electrical circuit?', 'To generate electricity', 'To convert AC to DC', 'To change the voltage', 'To store energy', 'C', 'A transformer is used in electrical circuits to change the voltage level, either increasing (step-up) or decreasing (step-down) the voltage.', 'medium', '2025-09-09T06:29:36.272Z'),
  ('25508c5c-e2bb-4169-89aa-d3f480f7b6ca', NULL, 'Which of the following is the best conductor of electricity?', 'Silver', 'Gold', 'Copper', 'Aluminum', 'A', 'Silver is the best conductor of electricity due to its highest electrical conductivity among all metals, though copper is more commonly used due to cost considerations.', 'medium', '2025-09-09T06:29:36.320Z'),
  ('570530d4-fcf7-42fd-8ece-7a260334a2b4', NULL, 'What is the term for the resistance to motion when an object is moving through a fluid?', 'Friction', 'Drag', 'Tension', 'Upthrust', 'B', 'Drag is the resistance force caused by the motion of an object through a fluid, such as air or water.', 'medium', '2025-09-09T06:29:36.372Z');

ALTER TABLE "questions" ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");


-- Table: quiz_question_answers (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quiz_question_answers" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "quiz_session_id" CHARACTER VARYING NOT NULL,
  "quiz_question_id" CHARACTER VARYING NOT NULL,
  "quiz_question_choice_id" CHARACTER VARYING,
  "answer" TEXT,
  "is_correct" BOOLEAN NOT NULL,
  "marks" INTEGER DEFAULT 0,
  "sparks" INTEGER DEFAULT 0,
  "time_spent" INTEGER,
  "answered_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "quiz_question_answers" ADD CONSTRAINT "quiz_question_answers_pkey" PRIMARY KEY ("id");


-- Table: quiz_question_choices (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quiz_question_choices" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "quiz_question_id" CHARACTER VARYING NOT NULL,
  "content" TEXT NOT NULL,
  "is_correct" BOOLEAN NOT NULL DEFAULT false,
  "order_index" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "quiz_question_choices" ADD CONSTRAINT "quiz_question_choices_pkey" PRIMARY KEY ("id");


-- Table: quiz_questions (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "quiz_id" CHARACTER VARYING NOT NULL,
  "content" TEXT NOT NULL,
  "question_type_id" CHARACTER VARYING NOT NULL,
  "marks" INTEGER NOT NULL DEFAULT 1,
  "difficulty" CHARACTER VARYING NOT NULL DEFAULT 'medium'::character varying,
  "explanation" TEXT,
  "order_index" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");


-- Table: quiz_sessions (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quiz_sessions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "profile_id" CHARACTER VARYING NOT NULL,
  "subject_id" CHARACTER VARYING NOT NULL,
  "quiz_type" CHARACTER VARYING NOT NULL,
  "topic_id" CHARACTER VARYING,
  "term_id" CHARACTER VARYING,
  "quiz_questions" JSONB,
  "total_questions" INTEGER DEFAULT 30,
  "current_question_index" INTEGER DEFAULT 0,
  "correct_answers" INTEGER DEFAULT 0,
  "sparks_earned" INTEGER DEFAULT 0,
  "time_spent" INTEGER,
  "completed" BOOLEAN DEFAULT false,
  "started_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "completed_at" TIMESTAMP WITHOUT TIME ZONE
);

ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id");


-- Table: quiz_settings (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quiz_settings" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "sparks_per_correct_answer" INTEGER NOT NULL DEFAULT 5,
  "accuracy_bonus_threshold" NUMERIC(3,2) DEFAULT 0.80,
  "accuracy_bonus_multiplier" NUMERIC(3,2) DEFAULT 1.50,
  "good_accuracy_threshold" NUMERIC(3,2) DEFAULT 0.60,
  "good_accuracy_multiplier" NUMERIC(3,2) DEFAULT 1.20,
  "max_questions_per_quiz" INTEGER DEFAULT 15,
  "min_questions_per_quiz" INTEGER DEFAULT 5,
  "time_per_question_seconds" INTEGER DEFAULT 45,
  "allow_skip_questions" BOOLEAN DEFAULT false,
  "show_correct_answers" BOOLEAN DEFAULT true,
  "show_explanations" BOOLEAN DEFAULT true,
  "randomize_questions" BOOLEAN DEFAULT true,
  "randomize_options" BOOLEAN DEFAULT true,
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_by" CHARACTER VARYING
);

INSERT INTO "quiz_settings" ("id", "sparks_per_correct_answer", "accuracy_bonus_threshold", "accuracy_bonus_multiplier", "good_accuracy_threshold", "good_accuracy_multiplier", "max_questions_per_quiz", "min_questions_per_quiz", "time_per_question_seconds", "allow_skip_questions", "show_correct_answers", "show_explanations", "randomize_questions", "randomize_options", "updated_at", "updated_by") VALUES
  ('5f90d336-60bc-49f2-9805-4193814ca90c', 5, '0.80', '1.50', '0.60', '1.20', 15, 5, 45, FALSE, TRUE, TRUE, TRUE, TRUE, '2025-09-09T06:55:35.979Z', NULL);

ALTER TABLE "quiz_settings" ADD CONSTRAINT "quiz_settings_pkey" PRIMARY KEY ("id");


-- Table: quiz_types (3 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quiz_types" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "code" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "quiz_types" ("id", "title", "description", "code", "created_at") VALUES
  ('b4963402-d963-45a5-a025-1dce901f720c', 'Random Quiz', 'Questions from all topics and subjects', 'random', '2025-09-02T17:39:20.466Z'),
  ('90ad5b0f-fc9e-45c2-8c95-ddc5594ef08a', 'Topical Quiz', 'Questions focused on specific topics', 'topical', '2025-09-02T17:39:20.466Z'),
  ('186c08a7-513a-42e2-baa4-25c283b6c804', 'Termly Quiz', 'Questions organized by academic terms', 'termly', '2025-09-02T17:39:20.466Z');

ALTER TABLE "quiz_types" ADD CONSTRAINT "quiz_types_pkey" PRIMARY KEY ("id");


-- Table: quizzes (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "quizzes" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "level_id" CHARACTER VARYING NOT NULL,
  "subject_id" CHARACTER VARYING NOT NULL,
  "quiz_type" CHARACTER VARYING NOT NULL,
  "topic_id" CHARACTER VARYING,
  "term_id" CHARACTER VARYING,
  "questions" JSONB NOT NULL,
  "total_questions" INTEGER NOT NULL,
  "time_limit" INTEGER NOT NULL,
  "difficulty" CHARACTER VARYING DEFAULT 'medium'::character varying,
  "is_active" BOOLEAN DEFAULT true,
  "created_by" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");


-- Table: sessions (6 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" CHARACTER VARYING NOT NULL,
  "sess" JSONB NOT NULL,
  "expire" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

INSERT INTO "sessions" ("sid", "sess", "expire") VALUES
  ('v5-g-efy2lCW1bjRh88_KYfNTIwlVbrx', '{"user":{"id":"936850c0-162a-4336-806c-c374a9b59952","email":"joemaina180@gmail.com","lastName":"m","firstName":"m"},"cookie":{"path":"/","secure":false,"expires":"2025-09-18T11:16:02.398Z","httpOnly":true,"originalMaxAge":604800000},"adminId":"4938b6f3-3af2-434c-b39a-192af2ad0abc","isAdminAuthenticated":true}', '2025-09-18T11:16:03.000Z'),
  ('ZEu2BnL28PBJDUWQt21dd4ijNx8wEMmA', '{"user":{"id":"317e8e6d-8e16-4ef3-b1b4-77cdaf916d5c","email":"test.signup@example.com","lastName":"Signup","firstName":"Test"},"cookie":{"path":"/","secure":false,"expires":"2025-09-23T13:49:00.350Z","httpOnly":true,"originalMaxAge":604800000}}', '2025-09-23T13:49:01.000Z'),
  ('KozVQ6_DcaXJ2vWWy_Oe2d-XzycdkSdb', '{"user":{"id":"317e8e6d-8e16-4ef3-b1b4-77cdaf916d5c","email":"test.signup@example.com","lastName":"Signup","firstName":"Test"},"cookie":{"path":"/","secure":false,"expires":"2025-09-23T13:49:17.594Z","httpOnly":true,"originalMaxAge":604800000}}', '2025-09-23T13:49:18.000Z'),
  ('DjKhsDyuVAIIhfHi82zbDE_RdvDMqXMx', '{"user":{"id":"317e8e6d-8e16-4ef3-b1b4-77cdaf916d5c","email":"test.signup@example.com","lastName":"Signup","firstName":"Test"},"cookie":{"path":"/","secure":false,"expires":"2025-09-23T13:52:50.243Z","httpOnly":true,"originalMaxAge":604800000}}', '2025-09-23T13:52:51.000Z'),
  ('UmbhbYlOo2RvRDRE7dzvo38rh1-6IQAz', '{"cookie":{"path":"/","secure":false,"expires":"2025-09-23T13:59:45.156Z","httpOnly":true,"originalMaxAge":604800000},"adminId":"a44795f9-d211-4f77-89f1-0beef05a888f","isAdminAuthenticated":true}', '2025-09-23T13:59:46.000Z'),
  ('5DExDzRK_bCcYGsRIyY3gW3c4E0ZHqTP', '{"user":{"id":"d87e114d-5958-4ba3-989c-0018fc506604","email":"gg@gmail.com","lastName":"g","firstName":"g"},"cookie":{"path":"/","secure":false,"expires":"2025-09-23T13:53:53.622Z","httpOnly":true,"originalMaxAge":604800000},"adminId":"6c77ade6-8784-4a33-a73c-11fb58d066ac","isAdminAuthenticated":true}', '2025-09-23T13:53:54.000Z');

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid");


-- Table: subjects (14 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "subjects" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "name" CHARACTER VARYING NOT NULL,
  "code" CHARACTER VARYING NOT NULL,
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "icon" CHARACTER VARYING,
  "color" CHARACTER VARYING,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "subjects" ("id", "name", "code", "examination_system_id", "icon", "color", "created_at") VALUES
  ('547ffc3a-b94d-4010-b5fd-b65773c12328', 'Mathematics', 'MATH', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'calculator', '#3B82F6', '2025-09-09T06:28:38.526Z'),
  ('75496eef-13e3-4071-8d37-6d6527ed07a5', 'English', 'ENG', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'book', '#10B981', '2025-09-09T06:28:38.581Z'),
  ('fa73a32a-7027-4fbe-bcda-7c0431763b22', 'Kiswahili', 'KISW', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'globe', '#F59E0B', '2025-09-09T06:28:38.625Z'),
  ('e391687a-3d73-447f-8942-28b4d9f0f33c', 'Biology', 'BIO', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'leaf', '#059669', '2025-09-09T06:28:38.668Z'),
  ('eb371e93-ddef-421e-9ff9-05b36a454e12', 'Physics', 'PHY', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'atom', '#7C3AED', '2025-09-09T06:28:38.713Z'),
  ('18c89482-24b4-400f-af4f-f9616ae884c2', 'Chemistry', 'CHEM', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'flask', '#DC2626', '2025-09-09T06:28:38.755Z'),
  ('2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'History & Government', 'HIST', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'scroll', '#8B5CF6', '2025-09-09T06:28:38.799Z'),
  ('e564e57b-97c1-47e2-8bf5-70c957ba2e4d', 'Geography', 'GEO', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'map', '#06B6D4', '2025-09-09T06:28:38.843Z'),
  ('c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'Business Studies', 'BST', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'briefcase', '#F59E0B', '2025-09-09T06:28:38.888Z'),
  ('4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'Agriculture', 'AGRI', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'sprout', '#22C55E', '2025-09-09T06:28:38.932Z'),
  ('0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'Computer Studies', 'COMP', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'monitor', '#3B82F6', '2025-09-09T06:28:38.974Z'),
  ('2f0c1d75-3acb-481f-a9a4-5b6700cfc2cc', 'Art & Design', 'ART', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'palette', '#EC4899', '2025-09-09T06:28:39.020Z'),
  ('1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'Home Science', 'HOME', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'home', '#F97316', '2025-09-09T06:28:39.064Z'),
  ('78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'Music', 'MUS', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'music', '#A855F7', '2025-09-09T06:28:39.109Z');

ALTER TABLE "subjects" ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");


-- Table: subscription_plans (3 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "name" CHARACTER VARYING NOT NULL,
  "code" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "price" NUMERIC(10,2) NOT NULL,
  "currency" CHARACTER VARYING DEFAULT 'KES'::character varying,
  "billing_cycle" CHARACTER VARYING DEFAULT 'weekly'::character varying,
  "daily_quiz_limit" INTEGER,
  "question_bank_size" INTEGER,
  "features" JSONB,
  "has_ai_personalization" BOOLEAN DEFAULT false,
  "support_level" CHARACTER VARYING DEFAULT 'basic'::character varying,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "subscription_plans" ("id", "name", "code", "description", "price", "currency", "billing_cycle", "daily_quiz_limit", "question_bank_size", "features", "has_ai_personalization", "support_level", "is_active", "sort_order", "created_at", "updated_at") VALUES
  ('1', 'Basic Plan', 'basic', 'Essential features for casual learners', '6.00', 'USD', 'weekly', 5, 1000, '["Basic quiz access","Limited questions","Email support"]', FALSE, 'email', TRUE, 1, '2025-08-22T13:11:43.819Z', '2025-08-22T13:11:43.819Z'),
  ('2', 'Premium Plan', 'premium', 'Perfect for serious students', '25.00', 'USD', 'weekly', NULL, 5000, '["Unlimited quizzes","AI explanations","Progress tracking","Priority support"]', TRUE, 'priority', TRUE, 2, '2025-08-22T13:11:43.819Z', '2025-08-22T13:11:43.819Z'),
  ('3', 'Premium Plus', 'premium_plus', 'Maximum learning potential', '50.00', 'USD', 'weekly', NULL, 10000, '["Everything in Premium","Advanced analytics","Custom study plans","1-on-1 tutoring","Exam predictions"]', TRUE, 'dedicated', TRUE, 3, '2025-08-22T13:11:43.819Z', '2025-08-22T13:11:43.819Z');

ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");


-- Table: terms (48 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "terms" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "terms" ("id", "examination_system_id", "title", "description", "order", "created_at") VALUES
  ('3417984d-8cce-44ec-a8b2-19fffffbb873', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Term 1', 'First academic term covering foundational topics', 1, '2025-09-09T06:28:39.863Z'),
  ('4c42f549-5abd-431d-86fc-c2db6f83d43b', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Term 2', 'Second academic term with intermediate topics', 2, '2025-09-09T06:28:39.912Z'),
  ('bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Term 3', 'Third academic term with advanced and review topics', 3, '2025-09-09T06:28:39.955Z'),
  ('50a37a85-6e83-4c96-9f7c-bc411c756581', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Michaelmas Term', 'First term of the academic year (September - December)', 1, '2025-09-09T06:28:39.999Z'),
  ('0f610102-d8e0-4532-a616-dd83f27b22a6', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Lent Term', 'Second term of the academic year (January - March)', 2, '2025-09-09T06:28:40.043Z'),
  ('bbfdd225-a974-49cd-b5e3-0586ec01e6d9', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Easter Term', 'Third term of the academic year (April - July)', 3, '2025-09-09T06:28:40.089Z'),
  ('cdd15bdc-433e-4971-94c9-59a877ee908b', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Term 1', 'First term of the primary school year (January - April)', 1, '2025-09-09T06:28:40.133Z'),
  ('2a112be9-af9f-4706-a972-c04f0e2f9217', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Term 2', 'Second term of the primary school year (May - August)', 2, '2025-09-09T06:28:40.187Z'),
  ('eb2982e5-5a7b-44d6-93c8-ef9c28b74f78', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Term 3', 'Third term of the primary school year (September - December)', 3, '2025-09-09T06:28:40.230Z'),
  ('05408d45-33aa-421e-96b6-3ebfb59505b7', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 1 Term 1', 'First term for Form 1 students (January - April)', 11, '2025-09-09T06:28:40.274Z'),
  ('60f822aa-54ac-4066-9b99-79f38a8345d6', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 1 Term 2', 'Second term for Form 1 students (May - August)', 12, '2025-09-09T06:28:40.317Z'),
  ('99f82484-1bee-4fae-b2a1-cd33c223874f', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 1 Term 3', 'Third term for Form 1 students (September - December)', 13, '2025-09-09T06:28:40.361Z'),
  ('425c888f-db9f-436d-8982-808647749dce', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 2 Term 1', 'First term for Form 2 students (January - April)', 21, '2025-09-09T06:28:40.404Z'),
  ('52b4a255-8747-4e3a-a4e9-392b63cca41b', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 2 Term 2', 'Second term for Form 2 students (May - August)', 22, '2025-09-09T06:28:40.451Z'),
  ('c790f336-21ed-491f-ae27-218477d622c1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 2 Term 3', 'Third term for Form 2 students (September - December)', 23, '2025-09-09T06:28:40.495Z'),
  ('7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 3 Term 1', 'First term for Form 3 students (January - April)', 31, '2025-09-09T06:28:40.538Z'),
  ('c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 3 Term 2', 'Second term for Form 3 students (May - August)', 32, '2025-09-09T06:28:40.582Z'),
  ('e068a27b-c6c3-4662-9445-e4c8abd691d6', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 3 Term 3', 'Third term for Form 3 students (September - December)', 33, '2025-09-09T06:28:40.625Z'),
  ('66e1c25d-5290-4979-b0f9-c505ce1e8859', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 4 Term 1', 'First term for Form 4 students (January - April)', 41, '2025-09-09T06:28:40.669Z'),
  ('8c7661b2-05ab-4eb4-9507-205243c23618', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 4 Term 2', 'Second term for Form 4 students (May - August)', 42, '2025-09-09T06:28:40.712Z'),
  ('0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'Form 4 Term 3', 'Third term for Form 4 students (September - December)', 43, '2025-09-09T06:28:40.756Z'),
  ('6aab3716-68c4-44c2-8a4a-500e80658de9', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 9 Michaelmas', 'Year 9 first term (September - December)', 91, '2025-09-09T06:28:40.799Z'),
  ('8396ffc3-0179-4baa-9a37-eb943778d681', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 9 Lent', 'Year 9 second term (January - March)', 92, '2025-09-09T06:28:40.843Z'),
  ('ab8d34ca-a460-4e30-a2dc-732701cf23b6', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 9 Easter', 'Year 9 third term (April - July)', 93, '2025-09-09T06:28:40.886Z'),
  ('2c407576-140f-4d1b-8411-e3d1836262db', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 10 Michaelmas', 'Year 10 first term (September - December)', 101, '2025-09-09T06:28:40.930Z'),
  ('3143c61f-98de-4d1e-99ee-e07a2ee07a36', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 10 Lent', 'Year 10 second term (January - March)', 102, '2025-09-09T06:28:40.973Z'),
  ('ff5f8969-aaca-4179-878c-2c74f863ca1a', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 10 Easter', 'Year 10 third term (April - July)', 103, '2025-09-09T06:28:41.017Z'),
  ('4eedb60e-0dd6-4e21-ab6a-2b9182e22035', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 11 Michaelmas', 'Year 11 first term (September - December)', 111, '2025-09-09T06:28:41.061Z'),
  ('d17ccaa8-6b6c-49b0-9c92-479c0c6be3bc', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 11 Lent', 'Year 11 second term (January - March)', 112, '2025-09-09T06:28:41.104Z'),
  ('fab31cf0-5152-4dc3-bae6-30e2e4abb173', '3c091257-02e2-4f0c-9adf-4233db6c7f1f', 'Year 11 Easter', 'Year 11 third term (April - July)', 113, '2025-09-09T06:28:41.148Z'),
  ('6b67a5c5-4ead-45b9-953f-28336aa3fc6b', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 1 Term 1', 'Grade 1 first term (January - April)', 11, '2025-09-09T06:28:41.191Z'),
  ('14f663a7-dac6-4ee2-9f5f-4ad8490473af', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 1 Term 2', 'Grade 1 second term (May - August)', 12, '2025-09-09T06:28:41.235Z'),
  ('eb60f2c1-e059-4e7c-bc95-7ecb5614e9af', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 1 Term 3', 'Grade 1 third term (September - December)', 13, '2025-09-09T06:28:41.279Z'),
  ('879433d8-1b96-4f01-b9c7-f8f9e6a3fdc4', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 2 Term 1', 'Grade 2 first term (January - April)', 21, '2025-09-09T06:28:41.322Z'),
  ('23af410e-b298-4845-8338-9caa48f59103', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 2 Term 2', 'Grade 2 second term (May - August)', 22, '2025-09-09T06:28:41.366Z'),
  ('ebe2a5e6-05f2-443c-b2d8-a8e16a0f3a32', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 2 Term 3', 'Grade 2 third term (September - December)', 23, '2025-09-09T06:28:41.409Z'),
  ('51cabbf4-8f13-4f54-82b7-79e85ae3b429', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 3 Term 1', 'Grade 3 first term (January - April)', 31, '2025-09-09T06:28:41.453Z'),
  ('19b200af-0e96-4b45-b04f-1a2764fc9fcc', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 3 Term 2', 'Grade 3 second term (May - August)', 32, '2025-09-09T06:28:41.497Z'),
  ('7983edd9-d34b-43b4-bff5-de9952e177f2', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 3 Term 3', 'Grade 3 third term (September - December)', 33, '2025-09-09T06:28:41.542Z'),
  ('3641f531-acaf-420f-a2a2-1aebb537877e', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 4 Term 1', 'Grade 4 first term (January - April)', 41, '2025-09-09T06:28:41.586Z'),
  ('e400af3b-fea2-45d2-a65b-aa7b65a6cac6', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 4 Term 2', 'Grade 4 second term (May - August)', 42, '2025-09-09T06:28:41.629Z'),
  ('c305762b-98f8-4789-bae9-59dd0f8f131d', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 4 Term 3', 'Grade 4 third term (September - December)', 43, '2025-09-09T06:28:41.672Z'),
  ('6eeb112a-0d12-4d1b-9fe7-8675e113fd62', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 5 Term 1', 'Grade 5 first term (January - April)', 51, '2025-09-09T06:28:41.716Z'),
  ('1eea785f-2ce5-43d3-845f-8619f30163a0', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 5 Term 2', 'Grade 5 second term (May - August)', 52, '2025-09-09T06:28:41.760Z'),
  ('172f833e-36ce-4661-9ff4-db8a6e00da92', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 5 Term 3', 'Grade 5 third term (September - December)', 53, '2025-09-09T06:28:41.803Z'),
  ('fc54e13d-d00b-482f-8f88-21a408b87ef1', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 6 Term 1', 'Grade 6 first term (January - April)', 61, '2025-09-09T06:28:41.850Z'),
  ('de10c0f2-aeee-4def-ace3-c07e112e1f65', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 6 Term 2', 'Grade 6 second term (May - August)', 62, '2025-09-09T06:28:41.893Z'),
  ('ed3fe3cc-814e-4a82-91aa-e4a9ef78bd64', '55d91204-9e44-4c9f-8497-fb61a4e4a661', 'Grade 6 Term 3', 'Grade 6 third term (September - December)', 63, '2025-09-09T06:28:41.939Z');

ALTER TABLE "terms" ADD CONSTRAINT "terms_pkey" PRIMARY KEY ("id");


-- Table: topics (239 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "topics" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "subject_id" CHARACTER VARYING NOT NULL,
  "level_id" CHARACTER VARYING NOT NULL,
  "term_id" CHARACTER VARYING NOT NULL,
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "summary_content" TEXT,
  "order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "topics" ("id", "examination_system_id", "subject_id", "level_id", "term_id", "title", "description", "summary_content", "order", "created_at") VALUES
  ('topic-chem-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Introduction to Chemistry', NULL, NULL, 1, '2025-09-09T06:29:20.548Z'),
  ('topic-chem-f1-classify', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Simple Classification of Substances', NULL, NULL, 2, '2025-09-09T06:29:20.598Z'),
  ('topic-chem-f1-acids', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Acids, Bases, and Indicators', NULL, NULL, 3, '2025-09-09T06:29:20.646Z'),
  ('topic-chem-f1-air', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Air and Combustion', NULL, NULL, 4, '2025-09-09T06:29:20.695Z'),
  ('topic-chem-f1-water', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Water and Hydrogen', NULL, NULL, 5, '2025-09-09T06:29:20.743Z'),
  ('topic-chem-f2-atom', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Structure of the Atom and The Periodic Table', NULL, NULL, 6, '2025-09-09T06:29:20.791Z'),
  ('topic-chem-f2-families', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Chemical Families', NULL, NULL, 7, '2025-09-09T06:29:20.839Z'),
  ('topic-chem-f2-bonding', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Structure and Bonding', NULL, NULL, 8, '2025-09-09T06:29:20.887Z'),
  ('topic-chem-f2-salts', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Salts', NULL, NULL, 9, '2025-09-09T06:29:20.938Z'),
  ('topic-chem-f2-electric', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Effect of an Electric Current on a Substance', NULL, NULL, 10, '2025-09-09T06:29:20.986Z'),
  ('topic-chem-f3-mole', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'The Mole and Chemical Equations', NULL, NULL, 11, '2025-09-09T06:29:21.033Z'),
  ('topic-chem-f3-gas', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Gas Laws', NULL, NULL, 12, '2025-09-09T06:29:21.081Z'),
  ('topic-chem-f3-organic1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Organic Chemistry I', NULL, NULL, 13, '2025-09-09T06:29:21.128Z'),
  ('topic-chem-f3-sulphur', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Sulphur and its Compounds', NULL, NULL, 14, '2025-09-09T06:29:21.176Z'),
  ('topic-chem-f3-chlorine', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Chlorine and its Compounds', NULL, NULL, 15, '2025-09-09T06:29:21.224Z'),
  ('topic-chem-f3-nitrogen', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Nitrogen and its Compounds', NULL, NULL, 16, '2025-09-09T06:29:21.272Z'),
  ('topic-chem-f4-acids-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Acids, Bases, and Salts (Revision & Expansion)', NULL, NULL, 17, '2025-09-09T06:29:21.320Z'),
  ('topic-chem-f4-energy-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '3417984d-8cce-44ec-a8b2-19fffffbb873', 'Energy Changes in Chemical and Physical Processes', NULL, NULL, 18, '2025-09-09T06:29:21.371Z'),
  ('topic-chem-f4-rates-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Reaction Rates and Reversible Reactions', NULL, NULL, 19, '2025-09-09T06:29:21.419Z'),
  ('topic-chem-f4-electro-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '4c42f549-5abd-431d-86fc-c2db6f83d43b', 'Electrochemistry (Continuation)', NULL, NULL, 20, '2025-09-09T06:29:21.467Z'),
  ('topic-chem-f4-metals-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Metals', NULL, NULL, 21, '2025-09-09T06:29:21.514Z'),
  ('topic-chem-f4-organic2-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Organic Chemistry II (Alkanols and Alkanoic Acids)', NULL, NULL, 22, '2025-09-09T06:29:21.575Z'),
  ('topic-chem-f4-radio-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'bdaca442-6f9d-4ddb-9d92-7ae933ccc637', 'Radioactivity', NULL, NULL, 23, '2025-09-09T06:29:21.628Z'),
  ('topic-phys-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Physics', 'Defines physics, its relationship with other subjects, career opportunities, and laboratory safety rules.', NULL, 1, '2025-09-09T06:29:21.676Z'),
  ('topic-phys-f1-measurements1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Measurements I', 'Covers fundamental physical quantities (length, mass, time, etc.) and the use of basic measuring instruments.', NULL, 2, '2025-09-09T06:29:21.722Z'),
  ('topic-phys-f1-force', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Force', 'Introduces the concept of force, its effects, and different types of forces, including gravity and friction. Distinguishes between mass and weight.', NULL, 3, '2025-09-09T06:29:21.771Z'),
  ('topic-phys-f1-pressure', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Pressure', 'Explains the concept of pressure in solids, liquids, and gases, along with their applications.', NULL, 4, '2025-09-09T06:29:21.819Z'),
  ('topic-phys-f1-matter', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Particulate Nature of Matter', 'Explores the three states of matter (solids, liquids, and gases) based on the kinetic theory of matter.', NULL, 5, '2025-09-09T06:29:21.867Z'),
  ('topic-phys-f1-expansion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Thermal Expansion', 'Deals with the expansion of solids, liquids, and gases when heated, and its applications and consequences.', NULL, 6, '2025-09-09T06:29:21.914Z'),
  ('topic-phys-f1-heat', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Heat Transfer', 'Covers the three modes of heat transfer: conduction, convection, and radiation.', NULL, 7, '2025-09-09T06:29:21.963Z'),
  ('topic-phys-f1-light', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Rectilinear Propagation and Reflection', 'Introduces the concept of light traveling in a straight line and its reflection on plane surfaces.', NULL, 8, '2025-09-09T06:29:22.013Z'),
  ('topic-phys-f1-electrostatics1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Electrostatics I', 'Covers the basics of static electricity, including charging by friction and induction.', NULL, 9, '2025-09-09T06:29:22.060Z'),
  ('topic-phys-f1-circuits', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Cells and Simple Circuits', 'Introduces the components of a simple electric circuit and the function of a cell as a power source.', NULL, 10, '2025-09-09T06:29:22.113Z'),
  ('topic-phys-f2-magnetism', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Magnetism', 'Properties of magnets, magnetic fields, and the process of magnetization and demagnetization.', NULL, 1, '2025-09-09T06:29:22.169Z'),
  ('topic-phys-f2-measurements2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Measurements II', 'Learning to use more precise measuring instruments like the Vernier caliper and micrometer screw gauge.', NULL, 2, '2025-09-09T06:29:22.217Z'),
  ('topic-phys-f2-moments', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Turning Effect of a Force', 'Introduces the concept of moments and the principle of moments, with applications in levers.', NULL, 3, '2025-09-09T06:29:22.265Z'),
  ('topic-phys-f2-equilibrium', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Equilibrium and Centre of Gravity', 'Explains different states of equilibrium and how the position of the center of gravity affects the stability of an object.', NULL, 4, '2025-09-09T06:29:22.314Z'),
  ('topic-phys-f2-mirrors', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Reflection at Curved Surfaces', 'Focuses on image formation by concave and convex mirrors.', NULL, 5, '2025-09-09T06:29:22.362Z'),
  ('topic-phys-f2-electromagnetic', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Magnetic Effect of an Electric Current', 'Studies the magnetic field produced by a current-carrying wire, leading to the study of electromagnets.', NULL, 6, '2025-09-09T06:29:22.410Z'),
  ('topic-phys-f2-hooke', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Hooke''s Law', 'Introduces the relationship between force and extension in an elastic material.', NULL, 7, '2025-09-09T06:29:22.457Z'),
  ('topic-phys-f2-waves1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Waves I', 'Covers the basic properties of waves and differentiates between transverse and longitudinal waves.', NULL, 8, '2025-09-09T06:29:22.510Z'),
  ('topic-phys-f2-sound', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Sound', 'Explains the nature, properties, and applications of sound waves.', NULL, 9, '2025-09-09T06:29:22.556Z'),
  ('topic-phys-f2-fluid', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Fluid Flow', 'Introduces the principles governing the flow of fluids, including streamline and turbulent flow.', NULL, 10, '2025-09-09T06:29:22.604Z'),
  ('topic-phys-f3-motion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Linear Motion', 'Deals with the motion of objects in a straight line, including concepts like displacement, velocity, acceleration, and the equations of motion.', NULL, 1, '2025-09-09T06:29:22.650Z'),
  ('topic-phys-f3-newton', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Newton''s Laws of Motion', 'Covers Newton''s three laws of motion and their applications in everyday life.', NULL, 2, '2025-09-09T06:29:22.697Z'),
  ('topic-phys-f3-energy', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Work, Energy, Power and Machines', 'Explains the concepts of work, energy (kinetic and potential), and power. Also covers the study of simple machines.', NULL, 3, '2025-09-09T06:29:22.746Z'),
  ('topic-phys-f3-electricity2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Current Electricity II', 'Expands on Form 1 topics, covering complex circuits, Ohm''s Law, and factors affecting resistance.', NULL, 4, '2025-09-09T06:29:22.792Z'),
  ('topic-phys-f3-waves2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Waves II', 'Covers more advanced wave concepts, including reflection, refraction, and superposition.', NULL, 5, '2025-09-09T06:29:22.839Z'),
  ('topic-phys-f3-electrostatics2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Electrostatics II', 'Covers electrostatic induction in more detail, as well as the concepts of electric fields and capacitance.', NULL, 6, '2025-09-09T06:29:22.887Z'),
  ('topic-phys-f3-heating', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Heating Effect of an Electric Current', 'Focuses on the relationship between electrical energy and heat energy, including the formula H = I²Rt.', NULL, 7, '2025-09-09T06:29:22.935Z'),
  ('topic-phys-f3-heat-quantity', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Quantity of Heat', 'Deals with calculating heat changes, including specific heat capacity and specific latent heat.', NULL, 8, '2025-09-09T06:29:22.983Z'),
  ('topic-phys-f3-refraction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Refraction of Light', 'Covers the bending of light as it passes between different media, including Snell''s Law and total internal reflection.', NULL, 9, '2025-09-09T06:29:23.030Z'),
  ('topic-phys-f3-gas', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Gas Laws', 'Studies the relationships between pressure, volume, and temperature for gases.', NULL, 10, '2025-09-09T06:29:23.078Z'),
  ('topic-phys-f4-lenses', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Thin Lenses', 'Covers image formation by concave and convex lenses, including the lens formula and linear magnification.', NULL, 1, '2025-09-09T06:29:23.125Z'),
  ('topic-phys-f4-circular', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Uniform Circular Motion', 'Explains motion in a circle, including centripetal force and centripetal acceleration.', NULL, 2, '2025-09-09T06:29:23.174Z'),
  ('topic-phys-f4-floating', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Floating and Sinking', 'Revisits pressure in fluids, focusing on the principles of floatation and Archimedes'' principle.', NULL, 3, '2025-09-09T06:29:23.223Z'),
  ('topic-phys-f4-spectrum', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Electromagnetic Spectrum', 'Students study the entire range of electromagnetic waves, their properties and applications.', NULL, 4, '2025-09-09T06:29:23.270Z'),
  ('topic-phys-f4-induction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Electromagnetic Induction', 'Covers how a changing magnetic field can produce an electric current, leading to the principles of generators and transformers.', NULL, 5, '2025-09-09T06:29:23.317Z'),
  ('topic-phys-f4-mains', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Mains Electricity', 'Focuses on the generation, transmission, and use of electricity for domestic and industrial purposes.', NULL, 6, '2025-09-09T06:29:23.370Z'),
  ('topic-phys-f4-cathode', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Cathode Rays and Cathode Ray Tube', 'Covers the properties of cathode rays and the workings of a CRT.', NULL, 7, '2025-09-09T06:29:23.416Z'),
  ('topic-phys-f4-xrays', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'X-rays', 'Explains the production, properties, uses, and dangers of X-rays.', NULL, 8, '2025-09-09T06:29:23.464Z'),
  ('topic-phys-f4-photoelectric', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Photoelectric Effect', 'A modern physics topic explaining how light can cause the emission of electrons from a metal surface.', NULL, 9, '2025-09-09T06:29:23.512Z'),
  ('topic-phys-f4-radioactivity', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Radioactivity', 'Covers the nature of radioactivity, different types of radiation, half-life, and the uses and dangers of radioactive materials.', NULL, 10, '2025-09-09T06:29:23.561Z'),
  ('topic-phys-f4-electronics', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Electronics', 'Introduces the basics of electronics, including semiconductors, diodes, and transistors.', NULL, 11, '2025-09-09T06:29:23.610Z'),
  ('topic-bio-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Biology', 'Definition of biology, its branches, the importance of studying biology, and the characteristics of living organisms.', NULL, 1, '2025-09-09T06:29:23.658Z'),
  ('topic-bio-f1-classification1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Classification I', 'Introduces the principles of classifying living organisms and the major taxonomic groups. Students also learn about the use of simple identification keys.', NULL, 2, '2025-09-09T06:29:23.706Z'),
  ('topic-bio-f1-cell', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'The Cell', 'Examines the cell as the basic unit of life, including the structure and function of various cell organelles in plant and animal cells.', NULL, 3, '2025-09-09T06:29:23.758Z'),
  ('topic-bio-f1-physiology', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Cell Physiology', 'Studies the functions of a cell, focusing on the movement of substances across the cell membrane through processes like diffusion, osmosis, and active transport.', NULL, 4, '2025-09-09T06:29:23.809Z'),
  ('topic-bio-f1-nutrition', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Nutrition in Plants and Animals', 'Covers the process of nutrition in living organisms, including photosynthesis in plants and different modes of feeding in animals.', NULL, 5, '2025-09-09T06:29:23.856Z'),
  ('topic-bio-f1-transport', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Transport in Plants and Animals', 'Explains the importance of transport systems and details the transport of water and nutrients in plants, as well as the circulatory systems in animals.', NULL, 6, '2025-09-09T06:29:23.904Z'),
  ('topic-bio-f1-gaseous', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Gaseous Exchange', 'Focuses on the process of gaseous exchange in both plants and animals, and the structures adapted for this function.', NULL, 7, '2025-09-09T06:29:23.951Z'),
  ('topic-bio-f2-respiration', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Respiration', 'Defines respiration, its importance, and the different types of respiration (aerobic and anaerobic) in living organisms.', NULL, 1, '2025-09-09T06:29:24.002Z'),
  ('topic-bio-f2-excretion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Excretion and Homeostasis', 'Covers the removal of metabolic waste products from the body (excretion) and the maintenance of a constant internal environment (homeostasis).', NULL, 2, '2025-09-09T06:29:24.051Z'),
  ('topic-bio-f2-reproduction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Reproduction in Plants and Animals', 'Explores the significance of reproduction and details both asexual and sexual reproduction in plants and animals.', NULL, 3, '2025-09-09T06:29:24.099Z'),
  ('topic-bio-f2-growth', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Growth and Development', 'Studies the processes of growth and development in living organisms, including metamorphosis in insects and growth curves in plants.', NULL, 4, '2025-09-09T06:29:24.146Z'),
  ('topic-bio-f2-classification2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Classification II', 'Expands on Form 1''s classification topic, providing a more detailed survey of the five kingdoms and their major phyla/divisions.', NULL, 5, '2025-09-09T06:29:24.194Z'),
  ('topic-bio-f3-ecology', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Ecology', 'Studies the relationship between living organisms and their environment, including ecosystems, energy flow, and nutrient cycling.', NULL, 1, '2025-09-09T06:29:24.242Z'),
  ('topic-bio-f3-genetics', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Genetics', 'Introduces the principles of heredity and variation. Key concepts include genes, chromosomes, Mendelian inheritance, and an overview of genetic disorders.', NULL, 2, '2025-09-09T06:29:24.290Z'),
  ('topic-bio-f3-evolution', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Evolution', 'Examines the theories and evidence of organic evolution, including natural selection and fossil records.', NULL, 3, '2025-09-09T06:29:24.337Z'),
  ('topic-bio-f3-health', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Human Health and Disease', 'Focuses on the causes, transmission, prevention, and control of common human diseases.', NULL, 4, '2025-09-09T06:29:24.385Z'),
  ('topic-bio-f3-irritability', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Irritability and Coordination in Plants', 'Explores how plants respond to stimuli through tropisms and nastic movements, and the role of plant hormones.', NULL, 5, '2025-09-09T06:29:24.433Z'),
  ('topic-bio-f4-support', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Support and Movement in Plants and Animals', 'Covers the various types of support systems in plants and animals, and the mechanisms of movement, including the human skeleton.', NULL, 1, '2025-09-09T06:29:24.481Z'),
  ('topic-bio-f4-coordination', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Coordination and Response in Animals', 'Details the nervous and endocrine systems in animals, and how they work together to coordinate responses to stimuli.', NULL, 2, '2025-09-09T06:29:24.527Z'),
  ('topic-bio-f4-senses', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'The Human Eye and Ear', 'Studies the structure and functions of the human eye and ear as specialized sense organs.', NULL, 3, '2025-09-09T06:29:24.575Z'),
  ('topic-bio-f4-human-reproduction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Reproduction and Development in Humans', 'An in-depth look at the human reproductive system, fertilization, and the stages of growth and development from conception to birth.', NULL, 4, '2025-09-09T06:29:24.623Z'),
  ('topic-bio-f4-immunity', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Human Health and Immunity', 'Expands on human health, focusing on the immune system, its components, and different types of immunity.', NULL, 5, '2025-09-09T06:29:24.671Z'),
  ('topic-bio-f4-drugs', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Drugs and Drug Abuse', 'Identifies common drugs and explains the effects of drug abuse on the human body and society.', NULL, 6, '2025-09-09T06:29:24.724Z'),
  ('topic-math-f1-numbers', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Numbers and Operations', 'Covers whole numbers, fractions, decimals, and their operations, including place values, rounding off, and significant figures. Also includes divisibility tests.', NULL, 1, '2025-09-09T06:29:24.771Z'),
  ('topic-math-f1-algebra1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Algebra I', 'Introduction to algebraic expressions, substitution, and simplification of linear equations. Includes brackets and factorization.', NULL, 2, '2025-09-09T06:29:24.819Z'),
  ('topic-math-f1-measurements', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Measurements', 'Covers length, mass, time, temperature, and money. Includes conversions and calculations involving area and volume of basic shapes.', NULL, 3, '2025-09-09T06:29:24.866Z'),
  ('topic-math-f1-geometry1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Geometry I', 'Introduction to basic geometric concepts: points, lines, angles, and shapes. Includes constructions using ruler and compasses.', NULL, 4, '2025-09-09T06:29:24.914Z'),
  ('topic-math-f1-ratio', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Ratio, Proportion, and Rate', 'Explains the concepts of ratio, direct and inverse proportion, and rate. Includes practical applications like currency exchange rates.', NULL, 5, '2025-09-09T06:29:24.961Z'),
  ('topic-math-f1-percentages', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Percentages', 'Covers percentage increase and decrease, profit and loss, and simple interest.', NULL, 6, '2025-09-09T06:29:25.009Z'),
  ('topic-math-f1-commercial1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Commercial Arithmetic I', 'Introduces basic financial mathematics concepts like discounts, commissions, salaries, and wages.', NULL, 7, '2025-09-09T06:29:25.057Z'),
  ('topic-math-f1-integers', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Integers', 'Covers positive and negative numbers, their representation on a number line, and operations involving them.', NULL, 8, '2025-09-09T06:29:25.105Z'),
  ('topic-math-f2-geometry2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Geometry II', 'Expands on Form 1 geometry, covering properties of triangles, quadrilaterals, and other polygons. Also includes angle properties of parallel lines.', NULL, 1, '2025-09-09T06:29:25.153Z'),
  ('topic-math-f2-measurements2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Measurements II', 'Focuses on the area of curved surfaces and the volume of cones, cylinders, and pyramids.', NULL, 2, '2025-09-09T06:29:25.201Z'),
  ('topic-math-f2-algebra2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Algebra II', 'Covers algebraic expressions and formulas, factorization of quadratic expressions, and solving linear inequalities.', NULL, 3, '2025-09-09T06:29:25.248Z'),
  ('topic-math-f2-circle', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'The Circle', 'Properties of chords and tangents to a circle. Includes calculations of arc length and sector area.', NULL, 4, '2025-09-09T06:29:25.295Z'),
  ('topic-math-f2-commercial2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Commercial Arithmetic II', 'Deals with compound interest, hire purchase, and income tax.', NULL, 5, '2025-09-09T06:29:25.342Z');

INSERT INTO "topics" ("id", "examination_system_id", "subject_id", "level_id", "term_id", "title", "description", "summary_content", "order", "created_at") VALUES
  ('topic-math-f2-indices', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Indices and Logarithms', 'Explains the laws of indices and their applications. Introduces logarithms and their use in calculations.', NULL, 6, '2025-09-09T06:29:25.390Z'),
  ('topic-math-f2-coordinates', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Coordinates and Graphs', 'Covers Cartesian coordinates, plotting points, and drawing linear graphs. Includes finding the gradient of a line.', NULL, 7, '2025-09-09T06:29:25.437Z'),
  ('topic-math-f3-quadratic', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Quadratic Equations', 'Solving quadratic equations using factorization, completing the square, and the quadratic formula.', NULL, 1, '2025-09-09T06:29:25.485Z'),
  ('topic-math-f3-approximation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Approximation and Errors', 'Discusses rounding off numbers and calculating absolute and relative errors. Includes the concept of error propagation.', NULL, 2, '2025-09-09T06:29:25.533Z'),
  ('topic-math-f3-trigonometry1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Trigonometry I', 'Introduction to sine, cosine, and tangent ratios for right-angled triangles. Includes solving problems involving angles of elevation and depression.', NULL, 3, '2025-09-09T06:29:25.581Z'),
  ('topic-math-f3-commercial3', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Commercial Arithmetic III', 'Deals with foreign exchange, compound interest (further), and other commercial transactions.', NULL, 4, '2025-09-09T06:29:25.629Z'),
  ('topic-math-f3-surds', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Surds and Logarithms', 'Covers simplification of surds and solving logarithmic equations. Connects logarithms to indices.', NULL, 5, '2025-09-09T06:29:25.678Z'),
  ('topic-math-f3-vectors1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Vectors I', 'Introduction to vectors, their representation, addition, and subtraction. Includes position vectors.', NULL, 6, '2025-09-09T06:29:25.725Z'),
  ('topic-math-f3-statistics1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Statistics I', 'Covers collection and organization of data, measures of central tendency (mean, median, and mode), and graphical representation of data.', NULL, 7, '2025-09-09T06:29:25.773Z'),
  ('topic-math-f4-trigonometry2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Trigonometry II', 'Expands on Form 3, covering trigonometric identities, graphs of trigonometric functions, and solving trigonometric equations.', NULL, 1, '2025-09-09T06:29:25.819Z'),
  ('topic-math-f4-vectors2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Vectors II', 'Focuses on column vectors and their use in transformations. Includes applications in geometry.', NULL, 2, '2025-09-09T06:29:25.867Z'),
  ('topic-math-f4-matrices', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Matrices and Transformations', 'Introduces matrices, their operations, and their use in representing linear transformations like translation, rotation, and reflection.', NULL, 3, '2025-09-09T06:29:25.913Z'),
  ('topic-math-f4-statistics2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Statistics II', 'Covers measures of dispersion (variance and standard deviation), and graphical representation of data using histograms and frequency polygons.', NULL, 4, '2025-09-09T06:29:25.964Z'),
  ('topic-math-f4-probability', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Probability', 'Explains the concepts of probability, combined events, and mutually exclusive events. Includes probability trees.', NULL, 5, '2025-09-09T06:29:26.011Z'),
  ('topic-math-f4-linear', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Linear Programming', 'Solving optimization problems by graphing linear inequalities and identifying feasible regions.', NULL, 6, '2025-09-09T06:29:26.058Z'),
  ('topic-math-f4-calculus', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Calculus (Differentiation and Integration)', 'Introduction to differentiation, finding the gradient of a curve, and applications in kinematics. Also covers the basics of integration.', NULL, 7, '2025-09-09T06:29:26.107Z'),
  ('topic-hist-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to History and Government', 'Defines history and government, their relationship, sources of historical information, and the importance of studying the subject.', NULL, 1, '2025-09-09T06:29:26.155Z'),
  ('topic-hist-f1-early-man', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'The Early Man', 'Covers the origin and evolution of man, cultural and economic practices of Early Man, and the transition from hunting and gathering to settled life.', NULL, 2, '2025-09-09T06:29:26.202Z'),
  ('topic-hist-f1-agriculture', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Development of Agriculture', 'Explores the origins of agriculture, the agrarian revolution, and the challenges of food security in Africa and the world.', NULL, 3, '2025-09-09T06:29:26.249Z'),
  ('topic-hist-f1-people-kenya', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'The People of Kenya Up to the 19th Century', 'Details the origin, migration, and settlement of various communities in Kenya, including the Bantu, Nilotes, and Cushites.', NULL, 4, '2025-09-09T06:29:26.297Z'),
  ('topic-hist-f1-socio-economic', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Socio-Economic and Political Organisation of Kenyan Communities in the 19th Century', 'Examines the social, political, and economic structures of Kenyan communities before the colonial period.', NULL, 5, '2025-09-09T06:29:26.349Z'),
  ('topic-hist-f1-contacts', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Contacts Between East Africa and the Outside World Up to the 19th Century', 'Covers the interactions between East African communities and visitors from the outside world, including Arabs, Persians, and Europeans.', NULL, 6, '2025-09-09T06:29:26.398Z'),
  ('topic-hist-f2-citizenship', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Citizenship', 'Defines citizenship, different types of citizenship, and the rights and responsibilities of a Kenyan citizen.', NULL, 1, '2025-09-09T06:29:26.444Z'),
  ('topic-hist-f2-integration', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'National Integration', 'Explores the meaning of national integration, factors that promote and hinder it, and strategies for fostering national unity in Kenya.', NULL, 2, '2025-09-09T06:29:26.492Z'),
  ('topic-hist-f2-trade', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Trade', 'Covers the history and development of trade, including regional and international trade routes.', NULL, 3, '2025-09-09T06:29:26.540Z'),
  ('topic-hist-f2-transport', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Development of Transport and Communication', 'Examines the evolution of transport and communication systems from early times to modern day.', NULL, 4, '2025-09-09T06:29:26.588Z'),
  ('topic-hist-f2-industry', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Development of Industry', 'Discusses the origins and evolution of industries, including the Industrial Revolution and its effects.', NULL, 5, '2025-09-09T06:29:26.640Z'),
  ('topic-hist-f2-urbanisation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Urbanisation', 'Covers the historical development of urban centres and the social, economic, and political effects of urbanization.', NULL, 6, '2025-09-09T06:29:26.688Z'),
  ('topic-hist-f3-invasion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'European Invasion of Africa and the Process of Colonisation', 'Examines the scramble for and partitioning of Africa, the reasons for European invasion, and the methods of colonial conquest.', NULL, 1, '2025-09-09T06:29:26.736Z'),
  ('topic-hist-f3-colonial-rule', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Establishment of Colonial Rule in Kenya', 'Details the establishment of British colonial administration in Kenya, including the role of the Imperial British East Africa Company (IBEACo).', NULL, 2, '2025-09-09T06:29:26.784Z'),
  ('topic-hist-f3-administration', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Colonial Administration', 'Covers the structures and policies of colonial administration, including direct and indirect rule, and the British system in Kenya.', NULL, 3, '2025-09-09T06:29:26.832Z'),
  ('topic-hist-f3-colonial-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Socio-Economic Developments during the Colonial Period in Kenya', 'Focuses on changes in land, labor, agriculture, and infrastructure during the colonial era and their impact on Kenyan societies.', NULL, 4, '2025-09-09T06:29:26.878Z'),
  ('topic-hist-f3-independence', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Political Developments and the Struggle for Independence in Kenya (1919-1963)', 'Explores the rise of African nationalism and the various political struggles that led to Kenya''s independence.', NULL, 5, '2025-09-09T06:29:26.926Z'),
  ('topic-hist-f3-leaders', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Lives and Contributions of Kenyan Leaders', 'Examines the roles and contributions of key Kenyan leaders who fought for independence and built the nation.', NULL, 6, '2025-09-09T06:29:26.974Z'),
  ('topic-hist-f3-government', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'The Formation, Structure, and Functions of the Government of Kenya', 'Introduces students to the three arms of government: the legislature, the executive, and the judiciary.', NULL, 7, '2025-09-09T06:29:27.023Z'),
  ('topic-hist-f4-world-wars', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'World Wars', 'Covers the causes, events, and results of the First and Second World Wars, and their global impact.', NULL, 1, '2025-09-09T06:29:27.070Z'),
  ('topic-hist-f4-international', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'International Relations', 'Explores the concept of international relations, including the formation and functions of international organizations like the United Nations (UN).', NULL, 2, '2025-09-09T06:29:27.118Z'),
  ('topic-hist-f4-cooperation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Co-operation in Africa', 'Discusses the history of Pan-Africanism and the role of regional and continental bodies like the Organization of African Unity (OAU) and the African Union (AU).', NULL, 3, '2025-09-09T06:29:27.166Z'),
  ('topic-hist-f4-kenya-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Social, Economic, and Political Developments and Challenges in Kenya Since Independence', 'Examines the changes and challenges Kenya has faced since 1963, including land issues, political changes, and economic policies.', NULL, 4, '2025-09-09T06:29:27.213Z'),
  ('topic-bus-f3-population', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Population and Employment', 'Examines population size, structure, and dynamics, and their relationship with employment and unemployment.', NULL, 6, '2025-09-09T06:29:28.308Z'),
  ('topic-hist-f4-africa-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Social, Economic, and Political Developments and Challenges in Africa Since Independence', 'Analyzes the post-independence challenges and developments in Africa, including coups, civil wars, and economic reforms.', NULL, 5, '2025-09-09T06:29:27.261Z'),
  ('topic-hist-f4-electoral', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'The Electoral Process and Functions of Government in Other Parts of the World', 'Compares electoral systems and government functions in different countries, such as the UK and the USA.', NULL, 6, '2025-09-09T06:29:27.309Z'),
  ('topic-hist-f4-devolved', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Devolved Government', 'Focuses on the concept and structure of devolved government in Kenya, its functions, and challenges.', NULL, 7, '2025-09-09T06:29:27.356Z'),
  ('topic-hist-f4-revenue', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Public Revenue and Expenditure in Kenya', 'Covers the sources of public revenue, how the government spends its money, and the role of institutions like the Kenya Revenue Authority (KRA).', NULL, 8, '2025-09-09T06:29:27.404Z'),
  ('topic-bus-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Business Studies', 'Defines business studies, its various components (e.g., economics, commerce, accounting), and the importance of studying the subject.', NULL, 1, '2025-09-09T06:29:27.452Z'),
  ('topic-bus-f1-environment', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Business and Its Environment', 'Examines the purpose of a business, types of business activities, and the various internal and external environments that affect a business''s operations.', NULL, 2, '2025-09-09T06:29:27.498Z'),
  ('topic-bus-f1-wants', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Satisfaction of Human Wants', 'Covers the characteristics of human wants, types of goods and services, and the concepts of scarcity, choice, and opportunity cost.', NULL, 3, '2025-09-09T06:29:27.546Z'),
  ('topic-bus-f1-production', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Production', 'Explains the meaning of production, types of production, factors of production, and the concept of division of labor and specialization.', NULL, 4, '2025-09-09T06:29:27.593Z'),
  ('topic-bus-f1-entrepreneurship', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Entrepreneurship', 'Introduces entrepreneurship, qualities of a good entrepreneur, and the importance of entrepreneurship in economic development.', NULL, 5, '2025-09-09T06:29:27.641Z'),
  ('topic-bus-f1-office', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'The Office', 'Covers the functions of an office, office equipment, and the roles and responsibilities of office staff.', NULL, 6, '2025-09-09T06:29:27.689Z'),
  ('topic-bus-f2-home-trade', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Home Trade', 'Examines the different types of retail and wholesale trade, channels of distribution, and factors influencing home trade.', NULL, 1, '2025-09-09T06:29:27.737Z'),
  ('topic-bus-f2-forms', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Forms of Business Units', 'Covers the different forms of business ownership, including sole proprietorships, partnerships, and companies, and their advantages and disadvantages.', NULL, 2, '2025-09-09T06:29:27.785Z'),
  ('topic-bus-f2-government', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Government and Business', 'Discusses the role of the government in business, including regulations, taxation, and the provision of public services.', NULL, 3, '2025-09-09T06:29:27.833Z'),
  ('topic-bus-f2-transport', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Transport', 'Explains the role and importance of transport, and the different modes of transport (road, rail, water, and air).', NULL, 4, '2025-09-09T06:29:27.881Z'),
  ('topic-bus-f2-communication', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Communication', 'Covers the meaning and types of communication, and the importance of effective communication in business.', NULL, 5, '2025-09-09T06:29:27.928Z'),
  ('topic-bus-f2-warehousing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Warehousing', 'Discusses the functions and types of warehouses, and the importance of storage in business.', NULL, 6, '2025-09-09T06:29:27.976Z'),
  ('topic-bus-f2-insurance', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Insurance', 'Introduces the concept of insurance, principles of insurance, and different classes of insurance policies.', NULL, 7, '2025-09-09T06:29:28.023Z'),
  ('topic-bus-f3-demand-supply', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Demand and Supply', 'Explains the concepts of demand and supply, the law of demand and supply, and how equilibrium price is determined.', NULL, 1, '2025-09-09T06:29:28.071Z'),
  ('topic-bus-f3-size-location', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Size and Location of a Firm', 'Covers the factors that influence the size and location of a business, as well as the concepts of economies and diseconomies of scale.', NULL, 2, '2025-09-09T06:29:28.118Z'),
  ('topic-bus-f3-markets', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Product Markets', 'Examines different types of market structures, including perfect competition, monopoly, and oligopoly.', NULL, 3, '2025-09-09T06:29:28.166Z'),
  ('topic-bus-f3-distribution', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'The Chain of Distribution', 'Discusses the various channels through which goods move from producers to consumers, including the roles of intermediaries.', NULL, 4, '2025-09-09T06:29:28.213Z'),
  ('topic-bus-f3-national-income', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'National Income', 'Introduces the concept of national income, its measurement, and the factors affecting it.', NULL, 5, '2025-09-09T06:29:28.260Z'),
  ('topic-bus-f3-transactions', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Business Transactions', 'Covers business documents, books of original entry, and the accounting process.', NULL, 7, '2025-09-09T06:29:28.355Z'),
  ('topic-bus-f4-documents', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Source Documents and Books of Original Entry', 'A more detailed look at business documents and their use in accounting, including ledgers and cash books.', NULL, 1, '2025-09-09T06:29:28.404Z'),
  ('topic-bus-f4-statements', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Financial Statements', 'Focuses on the preparation and analysis of financial statements, including the Trading, Profit and Loss account, and Balance Sheet.', NULL, 2, '2025-09-09T06:29:28.451Z'),
  ('topic-bus-f4-banking', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Money and Banking', 'Covers the meaning and functions of money, the development of banking, and the role of the Central Bank.', NULL, 3, '2025-09-09T06:29:28.498Z'),
  ('topic-bus-f4-finance', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Public Finance', 'Examines government revenue (taxation) and expenditure, and the role of public finance in the economy.', NULL, 4, '2025-09-09T06:29:28.546Z'),
  ('topic-bus-f4-inflation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Inflation', 'Discusses the meaning, causes, and effects of inflation on an economy.', NULL, 5, '2025-09-09T06:29:28.594Z'),
  ('topic-bus-f4-trade', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'International Trade', 'Covers the reasons for and benefits of international trade, trade restrictions, and balance of payments.', NULL, 6, '2025-09-09T06:29:28.642Z'),
  ('topic-bus-f4-development', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Economic Development and Planning', 'Explains the meaning of economic development, indicators of development, and the role of economic planning.', NULL, 7, '2025-09-09T06:29:28.689Z'),
  ('topic-comp-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Computers', 'Defines a computer, its characteristics, historical development, and the importance of computers in society. Also covers safety precautions in the computer lab.', NULL, 1, '2025-09-09T06:29:28.737Z'),
  ('topic-comp-f1-systems', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Computer Systems', 'Explains the elements of a computer system: hardware, software, and liveware. Details the functions of various hardware components like input devices, the Central Processing Unit (CPU), and output devices.', NULL, 2, '2025-09-09T06:29:28.786Z'),
  ('topic-comp-f1-os', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Operating Systems', 'Covers the definition, functions, and types of operating systems. Also includes file management, disk management, and how to install an operating system.', NULL, 3, '2025-09-09T06:29:28.833Z'),
  ('topic-comp-f2-spreadsheets', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Spreadsheets', 'Explains the purpose and components of a spreadsheet. Students learn to use formulas and functions, manage data, and create charts.', NULL, 2, '2025-09-09T06:29:28.929Z'),
  ('topic-comp-f2-databases', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Databases', 'Covers database concepts, different database models, and how to create and manipulate a simple database in a database management system.', NULL, 3, '2025-09-09T06:29:28.978Z'),
  ('topic-comp-f2-desktop', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Desktop Publishing', 'Introduces the concept and purpose of desktop publishing software for designing and producing publications like newsletters and brochures.', NULL, 4, '2025-09-09T06:29:29.025Z'),
  ('topic-comp-f2-internet', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Internet and E-mail', 'Covers the history and development of the internet, its importance, and how to use internet services like web browsing and e-mail.', NULL, 5, '2025-09-09T06:29:29.073Z'),
  ('topic-comp-f3-data-rep', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Data Representation in a Computer', 'Explains how data is represented in a computer using binary digits. Includes different number systems (binary, decimal, octal, hexadecimal) and binary arithmetic operations.', NULL, 1, '2025-09-09T06:29:29.119Z'),
  ('topic-comp-f3-processing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Data Processing', 'Discusses the data processing cycle, types of files, file organization methods, and different data processing modes.', NULL, 2, '2025-09-09T06:29:29.167Z'),
  ('topic-comp-f3-programming', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Elementary Programming Principles', 'Introduces programming concepts, levels of programming languages, and program development. Includes designing algorithms using flowcharts and pseudocode.', NULL, 3, '2025-09-09T06:29:29.213Z'),
  ('topic-comp-f3-system-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'System Development', 'Covers the concept of a system, information systems, and the stages of the System Development Life Cycle (SDLC).', NULL, 4, '2025-09-09T06:29:29.260Z'),
  ('topic-comp-f4-networking', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Networking and Data Communication', 'Explains the concepts of computer networks, types of networks (LAN, MAN, WAN), network topologies, and the benefits and limitations of networking.', NULL, 1, '2025-09-09T06:29:29.308Z'),
  ('topic-comp-f4-applications', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Application Areas of ICT', 'Covers the use of Information and Communication Technology (ICT) in various sectors like education, business, transport, and law enforcement.', NULL, 2, '2025-09-09T06:29:29.356Z'),
  ('topic-comp-f4-impact', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Impact of ICT on Society', 'Discusses the positive and negative effects of computers on society, including issues related to ethics, privacy, and health.', NULL, 3, '2025-09-09T06:29:29.404Z'),
  ('topic-comp-f4-careers', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Careers in ICT', 'Identifies various career opportunities in the field of ICT and the skills required for each.', NULL, 4, '2025-09-09T06:29:29.451Z'),
  ('topic-comp-f4-project', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Computer Project', 'This is a practical project where students apply the skills and knowledge acquired throughout the course to develop a complete system, from analysis to implementation.', NULL, 5, '2025-09-09T06:29:29.499Z'),
  ('topic-agri-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Agriculture', 'Defines agriculture, its importance in Kenya, and the challenges faced by farmers. Also covers historical development and the relationship between agriculture and other subjects.', NULL, 1, '2025-09-09T06:29:29.546Z'),
  ('topic-agri-f1-factors', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Factors Influencing Agriculture', 'Examines the various ecological (e.g., climate, soil, pests) and economic (e.g., market, transport, capital) factors that influence agricultural production.', NULL, 2, '2025-09-09T06:29:29.596Z'),
  ('topic-agri-f1-tools', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Tools and Equipment', 'Covers the identification, uses, and maintenance of various hand tools and equipment used in farming.', NULL, 3, '2025-09-09T06:29:29.644Z'),
  ('topic-agri-f1-crop1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Crop Production I', 'Explains the processes involved in crop production, from land preparation and planting to harvesting and marketing.', NULL, 4, '2025-09-09T06:29:29.691Z'),
  ('topic-agri-f2-soil1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Soil Fertility I', 'Introduces the concept of soil fertility, the components of soil, and methods of maintaining and improving soil fertility.', NULL, 1, '2025-09-09T06:29:29.739Z'),
  ('topic-agri-f2-livestock1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Livestock Production I', 'Covers the common livestock in Kenya, including cattle, poultry, and goats. Students learn about different breeds and their general management.', NULL, 2, '2025-09-09T06:29:29.786Z'),
  ('topic-agri-f2-economics1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Agricultural Economics I', 'Explains basic economic concepts in agriculture, such as land tenure, farm records, and marketing.', NULL, 3, '2025-09-09T06:29:29.834Z'),
  ('topic-agri-f2-crop2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Crop Production II', 'Expands on Form 1 topics, focusing on specific crops like maize, wheat, and coffee, and their cultivation practices.', NULL, 4, '2025-09-09T06:29:29.882Z'),
  ('topic-agri-f3-soil2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Soil Fertility II', 'A more detailed look at soil fertility, including soil conservation, manuring, and the use of fertilizers.', NULL, 1, '2025-09-09T06:29:29.929Z'),
  ('topic-agri-f3-livestock2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Livestock Production II', 'Covers advanced topics in livestock production, including nutrition, breeding, and disease control.', NULL, 2, '2025-09-09T06:29:29.976Z'),
  ('topic-agri-f3-economics2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Agricultural Economics II', 'Deals with advanced agricultural economics, including farm planning, budgeting, and sources of agricultural finance.', NULL, 3, '2025-09-09T06:29:30.024Z'),
  ('topic-agri-f4-pests', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Pests and Diseases of Crops', 'Covers the identification of common crop pests and diseases and their control methods. Includes both chemical and non-chemical methods.', NULL, 1, '2025-09-09T06:29:30.072Z'),
  ('topic-agri-f4-weeds', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Weeds', 'Explains the types of weeds, their effects, and the various methods of weed control.', NULL, 2, '2025-09-09T06:29:30.118Z'),
  ('topic-agri-f4-structures', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Agricultural Structures', 'Discusses the construction and maintenance of farm structures like fences, barns, and animal housing.', NULL, 3, '2025-09-09T06:29:30.166Z');

INSERT INTO "topics" ("id", "examination_system_id", "subject_id", "level_id", "term_id", "title", "description", "summary_content", "order", "created_at") VALUES
  ('topic-agri-f4-machinery', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Farm Power and Machinery', 'Covers the use and maintenance of different farm machinery, including tractors and irrigation equipment.', NULL, 4, '2025-09-09T06:29:30.213Z'),
  ('topic-agri-f4-processing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Agricultural Products Processing', 'Introduces the basic methods of processing and preserving agricultural produce to increase shelf life and value.', NULL, 5, '2025-09-09T06:29:30.261Z'),
  ('topic-agri-f4-environment', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Environmental Pollution and Conservation', 'Examines the causes and effects of environmental pollution from agricultural activities and the importance of conservation.', NULL, 6, '2025-09-09T06:29:30.309Z'),
  ('topic-home-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Home Science', 'Defines Home Science and its importance in daily life. Covers the scope of Home Science and its relationship with other subjects.', NULL, 1, '2025-09-09T06:29:30.356Z'),
  ('topic-home-f1-nutrition', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Food and Nutrition', 'Introduces the different food nutrients, their sources, and functions in the body. Covers meal planning for different groups and balanced diets.', NULL, 2, '2025-09-09T06:29:30.404Z'),
  ('topic-home-f1-kitchen', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'The Kitchen', 'Covers the layout of a good kitchen, kitchen tools and equipment, and basic food preparation methods.', NULL, 3, '2025-09-09T06:29:30.452Z'),
  ('topic-home-f1-fabric', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Fabric and Garment Construction I', 'Introduces different types of fabrics, their properties, and basic hand stitches. Students also learn how to use a sewing machine.', NULL, 4, '2025-09-09T06:29:30.500Z'),
  ('topic-home-f1-laundry', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Laundry Work I', 'Covers the principles of laundry, sorting clothes, and basic laundering processes for different fabrics.', NULL, 5, '2025-09-09T06:29:30.546Z'),
  ('topic-home-f2-home', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'The Home', 'Examines the characteristics of a healthy home and its components. Covers household chores and home maintenance.', NULL, 1, '2025-09-09T06:29:30.594Z'),
  ('topic-home-f2-first-aid', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'First Aid', 'Introduces the principles of first aid and how to handle common home accidents and emergencies.', NULL, 2, '2025-09-09T06:29:30.641Z'),
  ('topic-home-f2-consumer', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Consumer Education', 'Covers consumer rights and responsibilities, sources of consumer information, and how to make informed choices.', NULL, 3, '2025-09-09T06:29:30.691Z'),
  ('topic-home-f2-finance', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Family Finance', 'Discusses budgeting, saving, and managing family income and expenditure. Covers basic financial documents.', NULL, 4, '2025-09-09T06:29:30.737Z'),
  ('topic-home-f2-preservation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Food Preservation and Storage', 'Explains the reasons for preserving food and the various methods used for food preservation and storage.', NULL, 5, '2025-09-09T06:29:30.785Z'),
  ('topic-home-f3-hygiene', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Hygiene and Grooming', 'Covers personal hygiene, cleanliness, and the importance of good grooming and appearance.', NULL, 1, '2025-09-09T06:29:30.832Z'),
  ('topic-home-f3-childcare', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'Child Care and Development', 'Examines the needs of a child, the stages of child development, and the importance of immunisation.', NULL, 2, '2025-09-09T06:29:30.880Z'),
  ('topic-home-f3-clothing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Clothing and Fashion', 'Discusses clothing selection, care of clothes, and the influence of fashion on dressing.', NULL, 3, '2025-09-09T06:29:30.928Z'),
  ('topic-home-f3-housing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Housing', 'Covers the importance of housing, different types of housing, and factors to consider when choosing a house.', NULL, 4, '2025-09-09T06:29:30.979Z'),
  ('topic-home-f3-pests', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Household Pests', 'Identifies common household pests, their effects on the family, and methods of controlling them.', NULL, 5, '2025-09-09T06:29:31.027Z'),
  ('topic-home-f4-textiles', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Textiles and Fibres', 'A more detailed look at different types of textile fibres, their properties, and their uses in fabric production.', NULL, 1, '2025-09-09T06:29:31.075Z'),
  ('topic-home-f4-garment2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Garment Construction II', 'Expands on Form 1 topics, focusing on more complex garment construction, including pattern drafting and various types of seams and finishes.', NULL, 2, '2025-09-09T06:29:31.123Z'),
  ('topic-home-f4-etiquette', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Kitchen and Dining Room Etiquette', 'Covers table setting, dining etiquette, and proper manners for different social occasions.', NULL, 3, '2025-09-09T06:29:31.171Z'),
  ('topic-home-f4-diet', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Diet and Diseases', 'Discusses the relationship between diet and diseases. Covers nutritional deficiencies and lifestyle diseases.', NULL, 4, '2025-09-09T06:29:31.218Z'),
  ('topic-home-f4-project', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Home Science Project', 'A practical project that requires students to apply their skills in areas like garment construction, cooking, or home management.', NULL, 5, '2025-09-09T06:29:31.266Z'),
  ('topic-music-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Music', 'Defines music, its elements, and its importance in society. Also covers the different branches of music.', NULL, 1, '2025-09-09T06:29:31.319Z'),
  ('topic-music-f1-elements', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Elements of Music', 'Covers the fundamental elements of music, including rhythm, melody, harmony, and dynamics.', NULL, 2, '2025-09-09T06:29:31.367Z'),
  ('topic-music-f1-western', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '60f822aa-54ac-4066-9b99-79f38a8345d6', 'Western Musical Instruments', 'Identifies and classifies Western musical instruments, including those in the orchestra. Students learn to distinguish between string, woodwind, brass, and percussion instruments.', NULL, 3, '2025-09-09T06:29:31.415Z'),
  ('topic-music-f1-african', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'African Traditional Instruments', 'Examines the various categories of African musical instruments (e.g., idiophones, chordophones, aerophones) and their functions in different communities.', NULL, 4, '2025-09-09T06:29:31.463Z'),
  ('topic-music-f2-forms', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Forms of Music', 'Introduces different musical forms like binary, ternary, and rondo forms. Also covers African musical forms.', NULL, 1, '2025-09-09T06:29:31.511Z'),
  ('topic-music-f2-melody', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Melody', 'A more detailed look at melody, including melodic intervals, scales (major and minor), and different types of melodic movement.', NULL, 2, '2025-09-09T06:29:31.558Z'),
  ('topic-music-f2-harmony', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Harmony', 'Covers the concepts of harmony, chords (triads), and simple chord progressions. Students learn to build and identify basic chords.', NULL, 3, '2025-09-09T06:29:31.606Z'),
  ('topic-music-f2-rhythm', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '60190057-a240-4429-b2a5-f770958d3865', 'c790f336-21ed-491f-ae27-218477d622c1', 'Rhythm and Metre', 'Examines complex rhythmic patterns, time signatures, and syncopation. Students learn to clap and count complex rhythms.', NULL, 4, '2025-09-09T06:29:31.653Z'),
  ('topic-music-f3-history', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea', 'History of Western Music', 'Covers the major periods of Western music history, including the Baroque, Classical, and Romantic periods, and their key composers.', NULL, 1, '2025-09-09T06:29:31.700Z'),
  ('topic-music-f3-set-works', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'c79e5e7a-1226-4ee8-97d4-c4601380e64c', 'Set Works', 'A detailed study of specific musical compositions chosen by the Kenya National Examinations Council (KNEC). Students analyse these pieces in detail.', NULL, 2, '2025-09-09T06:29:31.748Z'),
  ('topic-music-f3-composition', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', 'e068a27b-c6c3-4662-9445-e4c8abd691d6', 'Composition', 'Introduces the principles of musical composition, including writing melodies, harmonizing, and arranging music for different instruments.', NULL, 3, '2025-09-09T06:29:31.796Z'),
  ('topic-music-f4-orchestral', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '66e1c25d-5290-4979-b0f9-c505ce1e8859', 'Orchestral and Band Instruments', 'A more in-depth study of the orchestra, including the seating arrangement and the roles of different instrumental sections.', NULL, 1, '2025-09-09T06:29:31.844Z'),
  ('topic-music-f4-aural', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '8c7661b2-05ab-4eb4-9507-205243c23618', 'Aural Training', 'Develops the student''s listening skills, including identifying intervals, chords, and rhythmic patterns by ear.', NULL, 2, '2025-09-09T06:29:31.892Z'),
  ('topic-comp-f2-word', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', '425c888f-db9f-436d-8982-808647749dce', 'Word Processors', 'Introduces word processing software, including creating, editing, and formatting documents, as well as creating tables and mail merge documents.', '# Computer Studies - Form 2 Notes

## Topic: Word Processors

### Introduction to Word Processors

A **word processor** is a software application used for creating, editing, formatting, and printing text documents. Unlike traditional typewriters, word processors offer a variety of features that enhance document creation and management.

### Key Features of Word Processors

1. **Document Creation**  
   Word processors allow users to create documents from scratch or modify existing ones. Common word processing software includes:
   - Microsoft Word
   - Google Docs
   - LibreOffice Writer

2. **Editing Tools**  
   Users can easily edit text using features such as:
   - Cut, Copy, and Paste
   - Undo and Redo
   - Find and Replace

3. **Formatting Options**  
   Formatting tools enhance the appearance of documents. These include:
   - Font styles (bold, italic, underline)
   - Font sizes
   - Text color
   - Paragraph alignment (left, center, right, justified)

4. **Inserting Elements**  
   Word processors allow the insertion of various elements to enrich documents:
   - Images
   - Tables
   - Hyperlinks
   - Shapes

5. **Spell Check and Grammar Check**  
   Most word processors come with built-in spelling and grammar checkers to help improve the quality of the text.

### Creating a Document

#### Steps to Create a Document

1. **Open the Word Processor**  
   Launch your chosen word processing software.

2. **Create a New Document**  
   Click on "File" > "New" or use the shortcut `Ctrl + N` (for Windows) or `Cmd + N` (for Mac).

3. **Type Your Content**  
   Start typing your document. Use the editing tools to correct errors or change text as necessary.

#### Example  
*Creating a simple letter:*
```
[Your Name]  
[Your Address]  
[City, State, Zip Code]  
[Email Address]  
[Date]  

Dear [Recipient''s Name],

I hope this message finds you well. I am writing to inform you about...

Sincerely,  
[Your Name]
```

### Editing and Formatting Documents

#### Editing Techniques

- **Cut, Copy, and Paste**  
   - **Cut**: Removes selected text and places it in the clipboard.
   - **Copy**: Duplicates selected text to the clipboard without removing it.
   - **Paste**: Inserts the text from the clipboard to the desired location.

- **Find and Replace**  
   Use this feature to search for specific words or phrases and replace them with others to save time.

#### Formatting Text

- **Changing Font Style and Size**  
   Select the text and choose the desired font style and size from the toolbar.

- **Adding Bullets and Numbering**  
   Use the bullet or numbering options in the toolbar to create lists.

- **Paragraph Alignment**  
   Highlight the paragraph and select the alignment option (left, center, right, justified) from the toolbar.

### Creating Tables

Tables are useful for organizing data and presenting information clearly.

#### Steps to Create a Table

1. **Insert a Table**  
   Click on "Insert" > "Table" and select the number of rows and columns required.

2. **Enter Data**  
   Click on each cell to enter the required data.

3. **Formatting the Table**  
   Use the table design options to adjust borders, shading, and text alignment within the table.

#### Example  
*Creating a simple table for student grades:*

| Student Name  | Subject   | Grade |
|---------------|-----------|-------|
| John Doe      | Mathematics| A     |
| Jane Smith    | English   | B     |
| Samuel Kim    | Science   | A-    |

### Mail Merge

Mail merge is a powerful feature that allows you to create personalized documents for multiple recipients.

#### Steps to Perform Mail Merge

1. **Create a Main Document**  
   This document contains the static content (e.g., a letter template).

2. **Create a Data Source**  
   This could be a list of recipients stored in a spreadsheet or database.

3. **Link Data Source to Main Document**  
   Use the mail merge feature to connect the data source.

4. **Insert Merge Fields**  
   Place merge fields (e.g., name, address) in the main document where personalization is needed.

5. **Finish the Merge**  
   Complete the process to generate individual documents for each recipient.

#### Example  
*Creating personalized letters for students:*
```
Dear <<FirstName>>,

Congratulations on your achievement in the recent examinations!

Best,  
[Your Name]
```

### Practical Applications

- **Business Use**: Companies use word processors for reports, memos, and official correspondence.
- **Educational Use**: Students use word processing tools for essays, assignments, and projects.
- **Personal Use**: Individuals create resumes, cover letters, and personal documents.

### Conclusion

Word processors are essential tools in modern education and business. Mastering their features can significantly enhance productivity and the quality of documents produced. Practice using different features in your word processing software to become more proficient.

### Summary of Key Terms

- **Word Processor**: A software application for creating and editing text documents.
- **Formatting**: Adjusting the appearance of text and paragraphs.
- **Mail Merge**: A feature that creates personalized documents for multiple recipients.
- **Table**: A structured arrangement of data in rows and columns.

--- 

These notes provide an overview of word processors, focusing on their functionality, practical applications, and operation. Remember to practice using these features to improve your skills!', 1, '2025-09-09T06:29:28.881Z'),
  ('topic-music-f4-society', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Music in Society', 'Examines the role of music in various social contexts, including ceremonies, entertainment, and communication.', '# Music in Society: Form 4 Music Notes

## Introduction
Music is an integral part of human culture and society. It serves various functions across different social contexts, including ceremonies, entertainment, and communication. Understanding the role of music in society helps us appreciate its significance in cultural identity and social cohesion.

## Key Concepts

### 1. Definition of Music
- **Music**: An art form consisting of sound combined in a way that is pleasing to the ear. It involves elements such as melody, harmony, rhythm, and timbre.

### 2. Functions of Music in Society
Music serves multiple purposes within social contexts:

#### A. Ceremonial Functions
- **Rituals and Traditions**: Music plays a vital role in ceremonies such as weddings, funerals, and initiation rites. For example, in many Kenyan cultures, traditional songs accompany weddings to celebrate union and love.
- **Religious Practices**: In churches and mosques, music is used to enhance worship. Hymns, chants, and gospel music are common in Christian services, while Nasheeds are popular in Islamic gatherings.

#### B. Entertainment
- **Performances**: Music is a primary form of entertainment, evident in concerts, festivals, and cultural events. Events like the **Lake of Stars Festival** in Malawi draw attendees for musical performances.
- **Media and Technology**: The rise of digital platforms like YouTube and Spotify has transformed how music is consumed, allowing artists to reach global audiences.

#### C. Communication
- **Social Commentary**: Music can serve as a form of expression and protest. For instance, Kenyan artists like **Eric Wainaina** use their music to address social issues such as corruption and governance.
- **Cultural Identity**: Traditional music often communicates cultural heritage and values, acting as a bridge between generations. 

## Examples of Music in Social Contexts

### 1. Ceremonies
- **Weddings**: In Kikuyu weddings, traditional songs are performed to bless the couple, showcasing cultural values and community support.
- **Funerals**: In Luo culture, mourners often sing dirges to honor the deceased, reflecting grief and community solidarity.

### 2. Entertainment
- **Local Festivals**: Events like the **Safi Safari Festival** celebrate local artistry and provide a platform for musicians to reach wider audiences.
- **Dance**: Traditional dances accompanied by music, such as the Maasai jumping dance, celebrate cultural heritage and community togetherness.

### 3. Communication
- **Protest Songs**: Artists like **Sautisol** use their music to comment on societal issues, resonating with the youth and fostering awareness.
- **Storytelling**: Traditional songs often narrate historical events, keeping the community''s history alive. For example, songs about the Mau Mau liberation movement play a crucial role in Kenyan history.

## Practical Applications

### 1. Participation in Local Music
- Encourage students to participate in school bands, choirs, or local music groups to experience music as a communal activity.

### 2. Analysis of Music in Media
- Students can analyze popular songs and their lyrics to explore themes of social justice, identity, and cultural expression.

### 3. Cultural Research Projects
- Assign research projects on different Kenyan ethnic groups'' music, exploring its role in ceremonies and daily life.

## Conclusion
Music is a powerful tool that shapes and reflects societal norms, values, and emotions. By examining its varied roles in ceremonies, entertainment, and communication, students can gain a deeper understanding of their cultural identity and the world around them. Engaging with music not only enhances appreciation for the arts but also fosters social cohesion and cultural pride. 

## Key Takeaways
- Music serves ceremonial, entertainment, and communicative functions in society.
- Different cultures use music to express identity and values.
- Engaging with music can enhance social awareness and cultural appreciation.

---

These notes provide a comprehensive overview of the role of music in society, aligning with the Form 4 curriculum. Students are encouraged to explore these themes further in their studies and practical applications.', 4, '2025-09-09T06:29:31.988Z'),
  ('topic-music-f4-dictation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '78a96ad4-6fe1-4209-8839-c0dd7c8b01bd', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c', 'Musical Dictation', 'A practical skill where students write down short melodies or rhythms played by the teacher. This is a crucial component of the final exam.', '', 3, '2025-09-09T06:29:31.940Z');

ALTER TABLE "topics" ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");


-- Table: trophies (3 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "trophies" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "icon" CHARACTER VARYING,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "trophies" ("id", "title", "description", "icon", "created_at") VALUES
  ('gold-trophy', 'Gold', 'Top performer of the month', '🥇', '2025-09-09T06:31:41.464Z'),
  ('silver-trophy', 'Silver', 'Second best performer', '🥈', '2025-09-09T06:31:41.522Z'),
  ('bronze-trophy', 'Bronze', 'Third best performer', '🥉', '2025-09-09T06:31:41.573Z');

ALTER TABLE "trophies" ADD CONSTRAINT "trophies_pkey" PRIMARY KEY ("id");


-- Table: user_answers (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_answers" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "quiz_session_id" CHARACTER VARYING NOT NULL,
  "question_id" CHARACTER VARYING NOT NULL,
  "user_answer" CHARACTER VARYING NOT NULL,
  "is_correct" BOOLEAN NOT NULL,
  "time_spent" INTEGER,
  "answered_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id");


-- Table: user_badges (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_badges" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "badge_id" CHARACTER VARYING NOT NULL,
  "count" INTEGER DEFAULT 1,
  "streaks" INTEGER DEFAULT 0,
  "last_earned_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");


-- Table: user_challenge_progress (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_challenge_progress" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "profile_id" CHARACTER VARYING NOT NULL,
  "challenge_id" CHARACTER VARYING NOT NULL,
  "current_value" INTEGER DEFAULT 0,
  "completed" BOOLEAN DEFAULT false,
  "completed_at" TIMESTAMP WITHOUT TIME ZONE,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_pkey" PRIMARY KEY ("id");


-- Table: user_challenges (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_challenges" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "challenge_id" CHARACTER VARYING NOT NULL,
  "completed" BOOLEAN DEFAULT false,
  "progress" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_pkey" PRIMARY KEY ("id");


-- Table: user_preference_changes (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_preference_changes" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "profile_id" CHARACTER VARYING NOT NULL,
  "change_type" CHARACTER VARYING NOT NULL,
  "previous_value" CHARACTER VARYING,
  "new_value" CHARACTER VARYING NOT NULL,
  "timestamp" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "is_active" BOOLEAN DEFAULT true
);

ALTER TABLE "user_preference_changes" ADD CONSTRAINT "user_preference_changes_pkey" PRIMARY KEY ("id");


-- Table: user_spark_boost (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_spark_boost" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "from_user_id" CHARACTER VARYING NOT NULL,
  "to_user_id" CHARACTER VARYING NOT NULL,
  "sparks" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "user_spark_boost" ADD CONSTRAINT "user_spark_boost_pkey" PRIMARY KEY ("id");


-- Table: user_subscriptions (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_subscriptions" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "plan_id" CHARACTER VARYING NOT NULL,
  "status" CHARACTER VARYING NOT NULL DEFAULT 'active'::character varying,
  "start_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "end_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "auto_renew" BOOLEAN DEFAULT true,
  "payment_method" CHARACTER VARYING,
  "paystack_customer_code" CHARACTER VARYING,
  "paystack_subscription_code" CHARACTER VARYING,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "user_subscriptions" ("id", "user_id", "plan_id", "status", "start_date", "end_date", "auto_renew", "payment_method", "paystack_customer_code", "paystack_subscription_code", "created_at", "updated_at") VALUES
  ('8fbef902-3b85-4947-9847-12ece9b6c1c1', 'd87e114d-5958-4ba3-989c-0018fc506604', '1', 'active', '2025-09-17T08:26:32.530Z', '2025-10-17T08:26:32.530Z', TRUE, 'paystack', NULL, NULL, '2025-09-17T08:26:32.547Z', '2025-09-17T08:26:32.547Z');

ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");


-- Table: user_trophies (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_trophies" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "trophy_id" CHARACTER VARYING NOT NULL,
  "count" INTEGER DEFAULT 1,
  "last_earned_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "user_trophies" ADD CONSTRAINT "user_trophies_pkey" PRIMARY KEY ("id");


-- Table: users (18 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "users" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "email" CHARACTER VARYING NOT NULL,
  "password" CHARACTER VARYING,
  "first_name" CHARACTER VARYING,
  "last_name" CHARACTER VARYING,
  "profile_image_url" CHARACTER VARYING,
  "default_profile_id" CHARACTER VARYING,
  "is_premium" BOOLEAN DEFAULT false,
  "credits" NUMERIC(10,2) DEFAULT 0.00,
  "is_active" BOOLEAN DEFAULT true,
  "email_verified" BOOLEAN DEFAULT false,
  "needs_password_setup" BOOLEAN DEFAULT false,
  "last_login_at" TIMESTAMP WITHOUT TIME ZONE,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "users" ("id", "email", "password", "first_name", "last_name", "profile_image_url", "default_profile_id", "is_premium", "credits", "is_active", "email_verified", "needs_password_setup", "last_login_at", "created_at", "updated_at") VALUES
  ('demo-student-1', 'aisha.mohamed@student.com', NULL, 'Aisha', 'Mohamed', 'https://images.unsplash.com/photo-1494790108755-2616b612b134?w=100', 'demo-profile-1', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.198Z', '2025-09-09T06:28:39.198Z'),
  ('demo-student-2', 'brian.kipkoech@student.com', NULL, 'Brian', 'Kipkoech', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'demo-profile-2', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.244Z', '2025-09-09T06:28:39.244Z'),
  ('demo-student-3', 'christine.wanjiku@student.com', NULL, 'Christine', 'Wanjiku', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 'demo-profile-3', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.288Z', '2025-09-09T06:28:39.288Z'),
  ('demo-student-4', 'david.otieno@student.com', NULL, 'David', 'Otieno', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 'demo-profile-4', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.334Z', '2025-09-09T06:28:39.334Z'),
  ('demo-student-5', 'esther.kamau@student.com', NULL, 'Esther', 'Kamau', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 'demo-profile-5', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.377Z', '2025-09-09T06:28:39.377Z'),
  ('demo-student-6', 'felix.mutua@student.com', NULL, 'Felix', 'Mutua', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', 'demo-profile-6', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.420Z', '2025-09-09T06:28:39.420Z'),
  ('demo-student-7', 'grace.njeri@student.com', NULL, 'Grace', 'Njeri', 'https://images.unsplash.com/photo-1494790108755-2616b612b134?w=100', 'demo-profile-7', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.464Z', '2025-09-09T06:28:39.464Z'),
  ('demo-student-8', 'hassan.omar@student.com', NULL, 'Hassan', 'Omar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 'demo-profile-8', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.508Z', '2025-09-09T06:28:39.508Z'),
  ('demo-student-9', 'irene.muthoni@student.com', NULL, 'Irene', 'Muthoni', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 'demo-profile-9', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.552Z', '2025-09-09T06:28:39.552Z'),
  ('demo-student-10', 'james.kinyua@student.com', NULL, 'James', 'Kinyua', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 'demo-profile-10', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.595Z', '2025-09-09T06:28:39.595Z'),
  ('17736882', 'josiahkamau180@gmail.com', NULL, 'Josiah', NULL, NULL, '4bef95c9-6f9c-406e-bd1b-7c5ef3efb4f7', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.638Z', '2025-09-09T06:28:39.638Z'),
  ('37410516', 'devmacmuriithi@gmail.com', NULL, 'Martin', 'Muriithi', NULL, '14337ce7-23f7-4740-a6ff-9878b1fb1e9c', FALSE, '514.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.681Z', '2025-09-09T06:28:39.681Z'),
  ('44280870', 'bettymoraa120@gmail.com', NULL, NULL, NULL, NULL, 'b3512572-dedb-41fb-8983-e2d24de995ee', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.724Z', '2025-09-09T06:28:39.724Z'),
  ('936850c0-162a-4336-806c-c374a9b59952', 'joemaina180@gmail.com', '$2b$12$C71AxNkild.bx.tgwr2OAuYUl.L8mebswQMdvXxf7MqyoiLdGlSU2', 'm', 'm', NULL, 'aa286446-8494-47b4-bb73-3758f72b620e', FALSE, '0.00', TRUE, FALSE, FALSE, '2025-09-11T11:16:02.350Z', '2025-09-09T06:16:39.151Z', '2025-09-09T06:33:45.420Z'),
  ('47111790', 'snappylearn@gmail.com', NULL, 'Snappylearn', 'Platform', NULL, 'c9e0304e-f77a-4d46-be50-b6d6fec66f49', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.819Z', '2025-09-11T11:30:23.621Z'),
  ('67d1854c-02e9-4ae6-b30e-6288f9388f4a', 'testdb@example.com', '$2b$12$test.hash.password', 'Test', 'User', NULL, NULL, FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-16T13:22:57.338Z', '2025-09-16T13:22:57.338Z'),
  ('317e8e6d-8e16-4ef3-b1b4-77cdaf916d5c', 'test.signup@example.com', '$2b$12$73JuS0FIeYw4YjsWCllPyuUrnokTMAhknpvwM3IHF9ouqs2C7F/ke', 'Test', 'Signup', NULL, NULL, FALSE, '0.00', TRUE, FALSE, FALSE, '2025-09-16T13:52:50.161Z', '2025-09-16T13:49:00.298Z', '2025-09-16T13:49:00.298Z'),
  ('d87e114d-5958-4ba3-989c-0018fc506604', 'gg@gmail.com', '$2b$12$jc68Rvs/xPmtVMI2ryOQt.1qfUOyeqGgHQSgAuxIoMjW4cnpZVBBi', 'g', 'g', NULL, '2f53acda-72bf-479e-9e83-c2683a250026', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-16T13:53:53.570Z', '2025-09-16T13:54:15.619Z');

ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


SET session_replication_role = DEFAULT;

-- Export completed
