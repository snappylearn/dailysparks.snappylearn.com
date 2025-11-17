-- PostgreSQL Database Export
-- Generated on: 2025-11-17T06:25:14.597Z
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


-- Table: admin_users (2 rows)
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
  ('6c77ade6-8784-4a33-a73c-11fb58d066ac', 'admin@dailysparks.com', '2b3cba30f0f51cd0bd9990bd32e150d36fe28e3c35ba1936ca34e0985aeb0b5a0790642059259d0c3425dc6eb4421377c53f477dc281f68fa93bef8b11278931.a478db7120bf47fe7bd843f66b6d9abb', 'Admin', 'User', 'super_admin', TRUE, '2025-11-16T22:04:14.825Z', '2025-09-02T17:22:39.670Z', '2025-11-16T22:04:14.825Z');

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
  "target_value" INTEGER NOT NULL DEFAULT 100,
  "sparks" INTEGER DEFAULT 0,
  "streaks" INTEGER DEFAULT 0,
  "badge_id" CHARACTER VARYING,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "challenges" ("id", "title", "description", "target_value", "sparks", "streaks", "badge_id", "is_active", "created_at", "updated_at") VALUES
  ('daily-50-sparks', 'Daily Spark Hunter', 'Earn 50 sparks today', 50, 10, 1, 'daily-fire', TRUE, '2025-09-09T06:31:41.620Z', '2025-09-09T06:31:41.620Z'),
  ('spark-collector-100', 'Spark Collector Challenge', 'Earn 100 total sparks', 100, 50, 0, 'spark-collector', TRUE, '2025-09-09T06:31:41.670Z', '2025-09-09T06:31:41.670Z'),
  ('spark-collection', 'Collect 1000 sparks', 'Accumulate 1000 total sparks from quizzes', 1000, 300, 0, 'spark-badge', TRUE, '2025-09-09T06:31:41.718Z', '2025-09-09T06:31:41.718Z'),
  ('weekly-top5', 'Weekly Champion', 'Maintain Top 5 rank for 3 days', 5, 100, 5, 'weekly-warrior', FALSE, '2025-09-09T06:31:41.764Z', '2025-09-09T06:31:41.764Z'),
  ('quiz-streak-7', 'Quiz Streak Master', 'Complete quizzes for 7 consecutive days', 7, 75, 7, 'streak-warrior', FALSE, '2025-09-09T06:31:41.810Z', '2025-09-09T06:31:41.810Z');

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


-- Table: general_settings (0 rows)
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


-- Table: notification_settings (0 rows)
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

ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id");


-- Table: password_reset_tokens (0 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "email" CHARACTER VARYING NOT NULL,
  "token" CHARACTER VARYING NOT NULL,
  "expires_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");


-- Table: payment_transactions (0 rows)
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

ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");


-- Table: profiles (15 rows)
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
  ('demo-profile-1', 'demo-student-1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2850, 45, 0, 0, 1, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:41.983Z', '2025-09-09T06:28:41.983Z'),
  ('demo-profile-2', 'demo-student-2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2720, 38, 0, 0, 2, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.030Z', '2025-09-09T06:28:42.030Z'),
  ('demo-profile-3', 'demo-student-3', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2650, 42, 0, 0, 3, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.074Z', '2025-09-09T06:28:42.074Z'),
  ('demo-profile-4', 'demo-student-4', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2480, 35, 0, 0, 4, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.118Z', '2025-09-09T06:28:42.118Z'),
  ('demo-profile-5', 'demo-student-5', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2390, 29, 0, 0, 5, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.160Z', '2025-09-09T06:28:42.160Z'),
  ('demo-profile-6', 'demo-student-6', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2210, 31, 0, 0, 6, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.208Z', '2025-09-09T06:28:42.208Z'),
  ('demo-profile-7', 'demo-student-7', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 2150, 27, 0, 0, 7, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.252Z', '2025-09-09T06:28:42.252Z'),
  ('demo-profile-8', 'demo-student-8', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 1980, 24, 0, 0, 8, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.297Z', '2025-09-09T06:28:42.297Z'),
  ('demo-profile-9', 'demo-student-9', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 1850, 21, 0, 0, 9, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.341Z', '2025-09-09T06:28:42.341Z'),
  ('demo-profile-10', 'demo-student-10', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 1720, 18, 0, 0, 10, NULL, '2025-08-09T08:40:51.457Z', TRUE, '2025-09-09T06:28:42.385Z', '2025-09-09T06:28:42.385Z'),
  ('14337ce7-23f7-4740-a6ff-9878b1fb1e9c', '37410516', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 175, 0, 1, 1, 11, '2025-08-21T00:00:00.000Z', '2025-08-21T11:59:31.891Z', TRUE, '2025-09-09T06:28:42.429Z', '2025-09-09T06:28:42.429Z'),
  ('4bef95c9-6f9c-406e-bd1b-7c5ef3efb4f7', '17736882', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '60190057-a240-4429-b2a5-f770958d3865', 'Term 1', 0, 0, 0, 0, NULL, NULL, '2025-08-25T09:24:20.701Z', TRUE, '2025-09-09T06:28:42.472Z', '2025-09-09T06:28:42.472Z'),
  ('b3512572-dedb-41fb-8983-e2d24de995ee', '44280870', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 0, 0, 0, 0, NULL, NULL, '2025-09-02T18:35:45.891Z', TRUE, '2025-09-09T06:28:42.517Z', '2025-09-09T06:28:42.517Z'),
  ('c9e0304e-f77a-4d46-be50-b6d6fec66f49', '47111790', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'Term 1', 289, 0, 1, 1, NULL, '2025-09-02T21:49:56.744Z', '2025-09-02T21:49:56.744Z', FALSE, '2025-09-09T06:29:20.495Z', '2025-09-11T11:30:23.551Z'),
  ('aa286446-8494-47b4-bb73-3758f72b620e', '936850c0-162a-4336-806c-c374a9b59952', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', 'Term 1', 472, 0, 1, 1, NULL, '2025-09-11T15:35:46.517Z', '2025-09-11T15:35:46.517Z', TRUE, '2025-09-09T06:33:45.334Z', '2025-09-11T15:35:46.517Z');

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


-- Table: questions (0 rows)
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


-- Table: quiz_settings (0 rows)
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
  "is_verified" BOOLEAN DEFAULT false,
  "created_by" CHARACTER VARYING NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");


-- Table: sessions (1 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" CHARACTER VARYING NOT NULL,
  "sess" JSONB NOT NULL,
  "expire" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

INSERT INTO "sessions" ("sid", "sess", "expire") VALUES
  ('URKy8Hlgp7NpAY61Vp1ikXrqLjjkY0BU', '{"cookie":{"path":"/","secure":false,"expires":"2025-11-23T22:04:14.570Z","httpOnly":true,"originalMaxAge":604800000},"adminId":"6c77ade6-8784-4a33-a73c-11fb58d066ac","isAdminAuthenticated":true}', '2025-11-23T22:04:15.000Z');

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
  ('1', 'Spark Starter', 'basic', 'Perfect for getting started with your KCSE/IGCSE/KPSEA preparation', '99.00', 'KES', 'weekly', 5, 1000, '["5 daily quizzes","KCSE/IGCSE/KPSEA question bank","Basic progress tracking","Email support","Quiz bank saving"]', FALSE, 'email', TRUE, 1, '2025-09-25T07:44:43.819Z', '2025-09-25T07:44:43.819Z'),
  ('2', 'Spark Champion', 'premium', 'Comprehensive exam preparation for serious students', '299.00', 'KES', 'weekly', NULL, 5000, '["Unlimited daily quizzes","AI-powered explanations","Advanced progress analytics","KCSE/IGCSE/KPSEA subject mastery","Streak tracking","Personalized study recommendations","Priority email support"]', TRUE, 'priority', TRUE, 2, '2025-09-25T07:44:43.819Z', '2025-09-25T07:44:43.819Z'),
  ('3', 'Spark Elite', 'premium_plus', 'Ultimate exam preparation with personalized tutoring', '499.00', 'KES', 'weekly', NULL, 10000, '["Everything in Spark Champion","Advanced AI personalization","Custom study plans","Exam prediction analytics","Performance insights","Term-specific question mastery","Topic weakness identification","Dedicated support chat"]', TRUE, 'dedicated', TRUE, 3, '2025-09-25T07:44:43.819Z', '2025-09-25T07:44:43.819Z');

ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");


-- Table: terms (3 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "terms" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "examination_system_id" CHARACTER VARYING NOT NULL,
  "level_id" CHARACTER VARYING NOT NULL,
  "title" CHARACTER VARYING NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "terms" ("id", "examination_system_id", "level_id", "title", "description", "order", "created_at") VALUES
  ('05408d45-33aa-421e-96b6-3ebfb59505b7', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 1', 'First term for Form 1 students (January - April)', 1, '2025-09-09T06:28:40.274Z'),
  ('99f82484-1bee-4fae-b2a1-cd33c223874f', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', 'Term 3', 'Third term for Form 1 students (September - December)', 3, '2025-09-09T06:28:40.361Z'),
  ('52b4a255-8747-4e3a-a4e9-392b63cca41b', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '60190057-a240-4429-b2a5-f770958d3865', 'Term 2', 'Second term for Form 2 students (May - August)', 2, '2025-09-09T06:28:40.451Z');

ALTER TABLE "terms" ADD CONSTRAINT "terms_pkey" PRIMARY KEY ("id");


-- Table: topics (200 rows)
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
  "insights_content" TEXT,
  "order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "topics" ("id", "examination_system_id", "subject_id", "level_id", "term_id", "title", "description", "summary_content", "insights_content", "order", "created_at") VALUES
  ('topic-phys-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Physics', 'Defines physics, its relationship with other subjects, career opportunities, and laboratory safety rules.', NULL, NULL, 1, '2025-09-09T06:29:21.676Z'),
  ('topic-phys-f1-measurements1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Measurements I', 'Covers fundamental physical quantities (length, mass, time, etc.) and the use of basic measuring instruments.', NULL, NULL, 2, '2025-09-09T06:29:21.722Z'),
  ('topic-phys-f1-force', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Force', 'Introduces the concept of force, its effects, and different types of forces, including gravity and friction. Distinguishes between mass and weight.', NULL, NULL, 3, '2025-09-09T06:29:21.771Z'),
  ('topic-chem-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Chemistry', NULL, NULL, NULL, 1, '2025-09-09T06:29:20.548Z'),
  ('topic-chem-f1-acids', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Acids, Bases, and Indicators', NULL, NULL, NULL, 3, '2025-09-09T06:29:20.646Z'),
  ('topic-chem-f1-air', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Air and Combustion', NULL, NULL, NULL, 4, '2025-09-09T06:29:20.695Z'),
  ('topic-chem-f2-bonding', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Structure and Bonding', NULL, NULL, NULL, 8, '2025-09-09T06:29:20.887Z'),
  ('topic-chem-f2-salts', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Salts', NULL, NULL, NULL, 9, '2025-09-09T06:29:20.938Z'),
  ('topic-chem-f3-organic1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Organic Chemistry I', NULL, NULL, NULL, 13, '2025-09-09T06:29:21.128Z'),
  ('topic-chem-f3-sulphur', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Sulphur and its Compounds', NULL, NULL, NULL, 14, '2025-09-09T06:29:21.176Z'),
  ('topic-chem-f4-rates-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Reaction Rates and Reversible Reactions', NULL, NULL, NULL, 19, '2025-09-09T06:29:21.419Z'),
  ('topic-chem-f4-electro-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Electrochemistry (Continuation)', NULL, NULL, NULL, 20, '2025-09-09T06:29:21.467Z'),
  ('topic-chem-f1-water', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Water and Hydrogen', NULL, NULL, NULL, 5, '2025-09-09T06:29:20.743Z'),
  ('topic-chem-f2-electric', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Effect of an Electric Current on a Substance', NULL, NULL, NULL, 10, '2025-09-09T06:29:20.986Z'),
  ('topic-chem-f3-chlorine', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Chlorine and its Compounds', NULL, NULL, NULL, 15, '2025-09-09T06:29:21.224Z'),
  ('topic-chem-f3-nitrogen', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Nitrogen and its Compounds', NULL, NULL, NULL, 16, '2025-09-09T06:29:21.272Z'),
  ('topic-chem-f4-metals-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Metals', NULL, NULL, NULL, 21, '2025-09-09T06:29:21.514Z'),
  ('topic-chem-f4-organic2-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Organic Chemistry II (Alkanols and Alkanoic Acids)', NULL, NULL, NULL, 22, '2025-09-09T06:29:21.575Z'),
  ('topic-chem-f4-radio-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Radioactivity', NULL, NULL, NULL, 23, '2025-09-09T06:29:21.628Z'),
  ('topic-phys-f1-pressure', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Pressure', 'Explains the concept of pressure in solids, liquids, and gases, along with their applications.', NULL, NULL, 4, '2025-09-09T06:29:21.819Z'),
  ('topic-phys-f1-matter', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Particulate Nature of Matter', 'Explores the three states of matter (solids, liquids, and gases) based on the kinetic theory of matter.', NULL, NULL, 5, '2025-09-09T06:29:21.867Z'),
  ('topic-phys-f1-expansion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Thermal Expansion', 'Deals with the expansion of solids, liquids, and gases when heated, and its applications and consequences.', NULL, NULL, 6, '2025-09-09T06:29:21.914Z'),
  ('topic-phys-f1-light', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Rectilinear Propagation and Reflection', 'Introduces the concept of light traveling in a straight line and its reflection on plane surfaces.', NULL, NULL, 8, '2025-09-09T06:29:22.013Z'),
  ('topic-phys-f1-electrostatics1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Electrostatics I', 'Covers the basics of static electricity, including charging by friction and induction.', NULL, NULL, 9, '2025-09-09T06:29:22.060Z'),
  ('topic-phys-f1-circuits', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Cells and Simple Circuits', 'Introduces the components of a simple electric circuit and the function of a cell as a power source.', NULL, NULL, 10, '2025-09-09T06:29:22.113Z'),
  ('topic-phys-f2-mirrors', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Reflection at Curved Surfaces', 'Focuses on image formation by concave and convex mirrors.', NULL, NULL, 5, '2025-09-09T06:29:22.362Z'),
  ('topic-phys-f2-electromagnetic', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Magnetic Effect of an Electric Current', 'Studies the magnetic field produced by a current-carrying wire, leading to the study of electromagnets.', NULL, NULL, 6, '2025-09-09T06:29:22.410Z'),
  ('topic-phys-f2-hooke', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Hooke''s Law', 'Introduces the relationship between force and extension in an elastic material.', NULL, NULL, 7, '2025-09-09T06:29:22.457Z'),
  ('topic-phys-f1-heat', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Heat Transfer', 'Covers the three modes of heat transfer: conduction, convection, and radiation.', NULL, NULL, 7, '2025-09-09T06:29:21.963Z'),
  ('topic-phys-f3-electricity2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Current Electricity II', 'Expands on Form 1 topics, covering complex circuits, Ohm''s Law, and factors affecting resistance.', NULL, NULL, 4, '2025-09-09T06:29:22.792Z'),
  ('topic-phys-f3-waves2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Waves II', 'Covers more advanced wave concepts, including reflection, refraction, and superposition.', NULL, NULL, 5, '2025-09-09T06:29:22.839Z'),
  ('topic-phys-f3-electrostatics2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Electrostatics II', 'Covers electrostatic induction in more detail, as well as the concepts of electric fields and capacitance.', NULL, NULL, 6, '2025-09-09T06:29:22.887Z'),
  ('topic-phys-f2-waves1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Waves I', 'Covers the basic properties of waves and differentiates between transverse and longitudinal waves.', NULL, NULL, 8, '2025-09-09T06:29:22.510Z'),
  ('topic-phys-f2-sound', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Sound', 'Explains the nature, properties, and applications of sound waves.', NULL, NULL, 9, '2025-09-09T06:29:22.556Z'),
  ('topic-phys-f2-fluid', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Fluid Flow', 'Introduces the principles governing the flow of fluids, including streamline and turbulent flow.', NULL, NULL, 10, '2025-09-09T06:29:22.604Z'),
  ('topic-bio-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Biology', 'Definition of biology, its branches, the importance of studying biology, and the characteristics of living organisms.', NULL, NULL, 1, '2025-09-09T06:29:23.658Z'),
  ('topic-bio-f1-classification1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Classification I', 'Introduces the principles of classifying living organisms and the major taxonomic groups. Students also learn about the use of simple identification keys.', NULL, NULL, 2, '2025-09-09T06:29:23.706Z'),
  ('topic-bio-f1-cell', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'The Cell', 'Examines the cell as the basic unit of life, including the structure and function of various cell organelles in plant and animal cells.', NULL, NULL, 3, '2025-09-09T06:29:23.758Z'),
  ('topic-bio-f1-transport', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Transport in Plants and Animals', 'Explains the importance of transport systems and details the transport of water and nutrients in plants, as well as the circulatory systems in animals.', NULL, NULL, 6, '2025-09-09T06:29:23.904Z'),
  ('topic-bio-f1-gaseous', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Gaseous Exchange', 'Focuses on the process of gaseous exchange in both plants and animals, and the structures adapted for this function.', NULL, NULL, 7, '2025-09-09T06:29:23.951Z'),
  ('topic-bio-f2-reproduction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Reproduction in Plants and Animals', 'Explores the significance of reproduction and details both asexual and sexual reproduction in plants and animals.', NULL, NULL, 3, '2025-09-09T06:29:24.099Z'),
  ('topic-bio-f2-growth', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Growth and Development', 'Studies the processes of growth and development in living organisms, including metamorphosis in insects and growth curves in plants.', NULL, NULL, 4, '2025-09-09T06:29:24.146Z'),
  ('topic-phys-f4-spectrum', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Electromagnetic Spectrum', 'Students study the entire range of electromagnetic waves, their properties and applications.', NULL, NULL, 4, '2025-09-09T06:29:23.270Z'),
  ('topic-phys-f4-induction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Electromagnetic Induction', 'Covers how a changing magnetic field can produce an electric current, leading to the principles of generators and transformers.', NULL, NULL, 5, '2025-09-09T06:29:23.317Z'),
  ('topic-phys-f4-mains', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Mains Electricity', 'Focuses on the generation, transmission, and use of electricity for domestic and industrial purposes.', NULL, NULL, 6, '2025-09-09T06:29:23.370Z'),
  ('topic-bio-f1-physiology', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Cell Physiology', 'Studies the functions of a cell, focusing on the movement of substances across the cell membrane through processes like diffusion, osmosis, and active transport.', NULL, NULL, 4, '2025-09-09T06:29:23.809Z'),
  ('topic-bio-f1-nutrition', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Nutrition in Plants and Animals', 'Covers the process of nutrition in living organisms, including photosynthesis in plants and different modes of feeding in animals.', NULL, NULL, 5, '2025-09-09T06:29:23.856Z'),
  ('topic-phys-f4-cathode', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Cathode Rays and Cathode Ray Tube', 'Covers the properties of cathode rays and the workings of a CRT.', NULL, NULL, 7, '2025-09-09T06:29:23.416Z'),
  ('topic-phys-f4-xrays', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'X-rays', 'Explains the production, properties, uses, and dangers of X-rays.', NULL, NULL, 8, '2025-09-09T06:29:23.464Z'),
  ('topic-phys-f4-photoelectric', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Photoelectric Effect', 'A modern physics topic explaining how light can cause the emission of electrons from a metal surface.', NULL, NULL, 9, '2025-09-09T06:29:23.512Z'),
  ('topic-phys-f4-radioactivity', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Radioactivity', 'Covers the nature of radioactivity, different types of radiation, half-life, and the uses and dangers of radioactive materials.', NULL, NULL, 10, '2025-09-09T06:29:23.561Z'),
  ('topic-phys-f4-electronics', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Electronics', 'Introduces the basics of electronics, including semiconductors, diodes, and transistors.', NULL, NULL, 11, '2025-09-09T06:29:23.610Z'),
  ('topic-math-f1-numbers', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Numbers and Operations', 'Covers whole numbers, fractions, decimals, and their operations, including place values, rounding off, and significant figures. Also includes divisibility tests.', NULL, NULL, 1, '2025-09-09T06:29:24.771Z'),
  ('topic-math-f1-algebra1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Algebra I', 'Introduction to algebraic expressions, substitution, and simplification of linear equations. Includes brackets and factorization.', NULL, NULL, 2, '2025-09-09T06:29:24.819Z'),
  ('topic-math-f1-measurements', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Measurements', 'Covers length, mass, time, temperature, and money. Includes conversions and calculations involving area and volume of basic shapes.', NULL, NULL, 3, '2025-09-09T06:29:24.866Z'),
  ('topic-math-f1-commercial1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Commercial Arithmetic I', 'Introduces basic financial mathematics concepts like discounts, commissions, salaries, and wages.', NULL, NULL, 7, '2025-09-09T06:29:25.057Z'),
  ('topic-math-f1-integers', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Integers', 'Covers positive and negative numbers, their representation on a number line, and operations involving them.', NULL, NULL, 8, '2025-09-09T06:29:25.105Z'),
  ('topic-bio-f3-genetics', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Genetics', 'Introduces the principles of heredity and variation. Key concepts include genes, chromosomes, Mendelian inheritance, and an overview of genetic disorders.', NULL, NULL, 2, '2025-09-09T06:29:24.290Z'),
  ('topic-bio-f3-evolution', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Evolution', 'Examines the theories and evidence of organic evolution, including natural selection and fossil records.', NULL, NULL, 3, '2025-09-09T06:29:24.337Z'),
  ('topic-bio-f4-senses', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'The Human Eye and Ear', 'Studies the structure and functions of the human eye and ear as specialized sense organs.', NULL, NULL, 3, '2025-09-09T06:29:24.575Z'),
  ('topic-bio-f4-human-reproduction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Reproduction and Development in Humans', 'An in-depth look at the human reproductive system, fertilization, and the stages of growth and development from conception to birth.', NULL, NULL, 4, '2025-09-09T06:29:24.623Z'),
  ('topic-math-f1-geometry1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Geometry I', 'Introduction to basic geometric concepts: points, lines, angles, and shapes. Includes constructions using ruler and compasses.', NULL, NULL, 4, '2025-09-09T06:29:24.914Z'),
  ('topic-bio-f2-classification2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Classification II', 'Expands on Form 1''s classification topic, providing a more detailed survey of the five kingdoms and their major phyla/divisions.', NULL, NULL, 5, '2025-09-09T06:29:24.194Z'),
  ('topic-bio-f3-health', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Human Health and Disease', 'Focuses on the causes, transmission, prevention, and control of common human diseases.', NULL, NULL, 4, '2025-09-09T06:29:24.385Z'),
  ('topic-bio-f3-irritability', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Irritability and Coordination in Plants', 'Explores how plants respond to stimuli through tropisms and nastic movements, and the role of plant hormones.', NULL, NULL, 5, '2025-09-09T06:29:24.433Z'),
  ('topic-bio-f4-immunity', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Human Health and Immunity', 'Expands on human health, focusing on the immune system, its components, and different types of immunity.', NULL, NULL, 5, '2025-09-09T06:29:24.671Z'),
  ('topic-bio-f4-drugs', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Drugs and Drug Abuse', 'Identifies common drugs and explains the effects of drug abuse on the human body and society.', NULL, NULL, 6, '2025-09-09T06:29:24.724Z'),
  ('topic-math-f2-circle', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'The Circle', 'Properties of chords and tangents to a circle. Includes calculations of arc length and sector area.', NULL, NULL, 4, '2025-09-09T06:29:25.295Z'),
  ('topic-math-f2-commercial2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Commercial Arithmetic II', 'Deals with compound interest, hire purchase, and income tax.', NULL, NULL, 5, '2025-09-09T06:29:25.342Z'),
  ('topic-hist-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to History and Government', 'Defines history and government, their relationship, sources of historical information, and the importance of studying the subject.', NULL, NULL, 1, '2025-09-09T06:29:26.155Z'),
  ('topic-hist-f1-early-man', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'The Early Man', 'Covers the origin and evolution of man, cultural and economic practices of Early Man, and the transition from hunting and gathering to settled life.', NULL, NULL, 2, '2025-09-09T06:29:26.202Z'),
  ('topic-math-f3-trigonometry1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Trigonometry I', 'Introduction to sine, cosine, and tangent ratios for right-angled triangles. Includes solving problems involving angles of elevation and depression.', NULL, NULL, 3, '2025-09-09T06:29:25.581Z'),
  ('topic-math-f3-commercial3', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Commercial Arithmetic III', 'Deals with foreign exchange, compound interest (further), and other commercial transactions.', NULL, NULL, 4, '2025-09-09T06:29:25.629Z'),
  ('topic-math-f3-surds', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Surds and Logarithms', 'Covers simplification of surds and solving logarithmic equations. Connects logarithms to indices.', NULL, NULL, 5, '2025-09-09T06:29:25.678Z'),
  ('topic-math-f4-statistics2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Statistics II', 'Covers measures of dispersion (variance and standard deviation), and graphical representation of data using histograms and frequency polygons.', NULL, NULL, 4, '2025-09-09T06:29:25.964Z'),
  ('topic-math-f4-probability', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Probability', 'Explains the concepts of probability, combined events, and mutually exclusive events. Includes probability trees.', NULL, NULL, 5, '2025-09-09T06:29:26.011Z'),
  ('topic-hist-f1-agriculture', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Development of Agriculture', 'Explores the origins of agriculture, the agrarian revolution, and the challenges of food security in Africa and the world.', NULL, NULL, 3, '2025-09-09T06:29:26.249Z'),
  ('topic-math-f2-indices', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Indices and Logarithms', 'Explains the laws of indices and their applications. Introduces logarithms and their use in calculations.', NULL, NULL, 6, '2025-09-09T06:29:25.390Z'),
  ('topic-math-f2-coordinates', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Coordinates and Graphs', 'Covers Cartesian coordinates, plotting points, and drawing linear graphs. Includes finding the gradient of a line.', NULL, NULL, 7, '2025-09-09T06:29:25.437Z'),
  ('topic-math-f3-vectors1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Vectors I', 'Introduction to vectors, their representation, addition, and subtraction. Includes position vectors.', NULL, NULL, 6, '2025-09-09T06:29:25.725Z'),
  ('topic-math-f3-statistics1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Statistics I', 'Covers collection and organization of data, measures of central tendency (mean, median, and mode), and graphical representation of data.', NULL, NULL, 7, '2025-09-09T06:29:25.773Z'),
  ('topic-math-f4-linear', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Linear Programming', 'Solving optimization problems by graphing linear inequalities and identifying feasible regions.', NULL, NULL, 6, '2025-09-09T06:29:26.058Z'),
  ('topic-math-f4-calculus', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Calculus (Differentiation and Integration)', 'Introduction to differentiation, finding the gradient of a curve, and applications in kinematics. Also covers the basics of integration.', NULL, NULL, 7, '2025-09-09T06:29:26.107Z'),
  ('topic-hist-f1-socio-economic', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Socio-Economic and Political Organisation of Kenyan Communities in the 19th Century', 'Examines the social, political, and economic structures of Kenyan communities before the colonial period.', NULL, NULL, 5, '2025-09-09T06:29:26.349Z'),
  ('topic-hist-f1-contacts', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Contacts Between East Africa and the Outside World Up to the 19th Century', 'Covers the interactions between East African communities and visitors from the outside world, including Arabs, Persians, and Europeans.', NULL, NULL, 6, '2025-09-09T06:29:26.398Z'),
  ('topic-hist-f2-trade', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Trade', 'Covers the history and development of trade, including regional and international trade routes.', NULL, NULL, 3, '2025-09-09T06:29:26.540Z'),
  ('topic-hist-f2-transport', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Development of Transport and Communication', 'Examines the evolution of transport and communication systems from early times to modern day.', NULL, NULL, 4, '2025-09-09T06:29:26.588Z'),
  ('topic-hist-f1-people-kenya', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'The People of Kenya Up to the 19th Century', 'Details the origin, migration, and settlement of various communities in Kenya, including the Bantu, Nilotes, and Cushites.', NULL, NULL, 4, '2025-09-09T06:29:26.297Z'),
  ('topic-hist-f3-administration', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Colonial Administration', 'Covers the structures and policies of colonial administration, including direct and indirect rule, and the British system in Kenya.', NULL, NULL, 3, '2025-09-09T06:29:26.832Z'),
  ('topic-hist-f3-colonial-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Socio-Economic Developments during the Colonial Period in Kenya', 'Focuses on changes in land, labor, agriculture, and infrastructure during the colonial era and their impact on Kenyan societies.', NULL, NULL, 4, '2025-09-09T06:29:26.878Z'),
  ('topic-hist-f4-kenya-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Social, Economic, and Political Developments and Challenges in Kenya Since Independence', 'Examines the changes and challenges Kenya has faced since 1963, including land issues, political changes, and economic policies.', NULL, NULL, 4, '2025-09-09T06:29:27.213Z'),
  ('topic-hist-f2-industry', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Development of Industry', 'Discusses the origins and evolution of industries, including the Industrial Revolution and its effects.', NULL, NULL, 5, '2025-09-09T06:29:26.640Z'),
  ('topic-hist-f2-urbanisation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Urbanisation', 'Covers the historical development of urban centres and the social, economic, and political effects of urbanization.', NULL, NULL, 6, '2025-09-09T06:29:26.688Z'),
  ('topic-bus-f3-population', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Population and Employment', 'Examines population size, structure, and dynamics, and their relationship with employment and unemployment.', NULL, NULL, 6, '2025-09-09T06:29:28.308Z'),
  ('topic-bus-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Business Studies', 'Defines business studies, its various components (e.g., economics, commerce, accounting), and the importance of studying the subject.', NULL, NULL, 1, '2025-09-09T06:29:27.452Z'),
  ('topic-bus-f1-environment', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Business and Its Environment', 'Examines the purpose of a business, types of business activities, and the various internal and external environments that affect a business''s operations.', NULL, NULL, 2, '2025-09-09T06:29:27.498Z'),
  ('topic-bus-f1-wants', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Satisfaction of Human Wants', 'Covers the characteristics of human wants, types of goods and services, and the concepts of scarcity, choice, and opportunity cost.', NULL, NULL, 3, '2025-09-09T06:29:27.546Z'),
  ('topic-bus-f1-office', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'The Office', 'Covers the functions of an office, office equipment, and the roles and responsibilities of office staff.', NULL, NULL, 6, '2025-09-09T06:29:27.689Z'),
  ('topic-bus-f2-government', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Government and Business', 'Discusses the role of the government in business, including regulations, taxation, and the provision of public services.', NULL, NULL, 3, '2025-09-09T06:29:27.833Z'),
  ('topic-bus-f2-transport', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Transport', 'Explains the role and importance of transport, and the different modes of transport (road, rail, water, and air).', NULL, NULL, 4, '2025-09-09T06:29:27.881Z');

INSERT INTO "topics" ("id", "examination_system_id", "subject_id", "level_id", "term_id", "title", "description", "summary_content", "insights_content", "order", "created_at") VALUES
  ('topic-hist-f4-africa-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Social, Economic, and Political Developments and Challenges in Africa Since Independence', 'Analyzes the post-independence challenges and developments in Africa, including coups, civil wars, and economic reforms.', NULL, NULL, 5, '2025-09-09T06:29:27.261Z'),
  ('topic-bus-f1-production', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Production', 'Explains the meaning of production, types of production, factors of production, and the concept of division of labor and specialization.', NULL, NULL, 4, '2025-09-09T06:29:27.593Z'),
  ('topic-bus-f1-entrepreneurship', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Entrepreneurship', 'Introduces entrepreneurship, qualities of a good entrepreneur, and the importance of entrepreneurship in economic development.', NULL, NULL, 5, '2025-09-09T06:29:27.641Z'),
  ('topic-bus-f3-markets', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Product Markets', 'Examines different types of market structures, including perfect competition, monopoly, and oligopoly.', NULL, NULL, 3, '2025-09-09T06:29:28.166Z'),
  ('topic-hist-f4-electoral', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'The Electoral Process and Functions of Government in Other Parts of the World', 'Compares electoral systems and government functions in different countries, such as the UK and the USA.', NULL, NULL, 6, '2025-09-09T06:29:27.309Z'),
  ('topic-hist-f4-devolved', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Devolved Government', 'Focuses on the concept and structure of devolved government in Kenya, its functions, and challenges.', NULL, NULL, 7, '2025-09-09T06:29:27.356Z'),
  ('topic-hist-f4-revenue', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Public Revenue and Expenditure in Kenya', 'Covers the sources of public revenue, how the government spends its money, and the role of institutions like the Kenya Revenue Authority (KRA).', NULL, NULL, 8, '2025-09-09T06:29:27.404Z'),
  ('topic-bus-f2-communication', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Communication', 'Covers the meaning and types of communication, and the importance of effective communication in business.', NULL, NULL, 5, '2025-09-09T06:29:27.928Z'),
  ('topic-bus-f2-warehousing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Warehousing', 'Discusses the functions and types of warehouses, and the importance of storage in business.', NULL, NULL, 6, '2025-09-09T06:29:27.976Z'),
  ('topic-comp-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Computers', 'Defines a computer, its characteristics, historical development, and the importance of computers in society. Also covers safety precautions in the computer lab.', NULL, NULL, 1, '2025-09-09T06:29:28.737Z'),
  ('topic-comp-f1-os', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Operating Systems', 'Covers the definition, functions, and types of operating systems. Also includes file management, disk management, and how to install an operating system.', NULL, NULL, 3, '2025-09-09T06:29:28.833Z'),
  ('topic-comp-f2-spreadsheets', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Spreadsheets', 'Explains the purpose and components of a spreadsheet. Students learn to use formulas and functions, manage data, and create charts.', NULL, NULL, 2, '2025-09-09T06:29:28.929Z'),
  ('topic-bus-f4-banking', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Money and Banking', 'Covers the meaning and functions of money, the development of banking, and the role of the Central Bank.', NULL, NULL, 3, '2025-09-09T06:29:28.498Z'),
  ('topic-bus-f4-finance', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Public Finance', 'Examines government revenue (taxation) and expenditure, and the role of public finance in the economy.', NULL, NULL, 4, '2025-09-09T06:29:28.546Z'),
  ('topic-comp-f1-systems', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Computer Systems', 'Explains the elements of a computer system: hardware, software, and liveware. Details the functions of various hardware components like input devices, the Central Processing Unit (CPU), and output devices.', NULL, NULL, 2, '2025-09-09T06:29:28.786Z'),
  ('topic-comp-f3-processing', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Data Processing', 'Discusses the data processing cycle, types of files, file organization methods, and different data processing modes.', NULL, NULL, 2, '2025-09-09T06:29:29.167Z'),
  ('topic-bus-f3-transactions', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Business Transactions', 'Covers business documents, books of original entry, and the accounting process.', NULL, NULL, 7, '2025-09-09T06:29:28.355Z'),
  ('topic-bus-f4-inflation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Inflation', 'Discusses the meaning, causes, and effects of inflation on an economy.', NULL, NULL, 5, '2025-09-09T06:29:28.594Z'),
  ('topic-bus-f4-trade', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'International Trade', 'Covers the reasons for and benefits of international trade, trade restrictions, and balance of payments.', NULL, NULL, 6, '2025-09-09T06:29:28.642Z'),
  ('topic-bus-f4-development', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Economic Development and Planning', 'Explains the meaning of economic development, indicators of development, and the role of economic planning.', NULL, NULL, 7, '2025-09-09T06:29:28.689Z'),
  ('topic-comp-f2-databases', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Databases', 'Covers database concepts, different database models, and how to create and manipulate a simple database in a database management system.', NULL, NULL, 3, '2025-09-09T06:29:28.978Z'),
  ('topic-comp-f2-desktop', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Desktop Publishing', 'Introduces the concept and purpose of desktop publishing software for designing and producing publications like newsletters and brochures.', NULL, NULL, 4, '2025-09-09T06:29:29.025Z'),
  ('topic-agri-f1-intro', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Introduction to Agriculture', 'Defines agriculture, its importance in Kenya, and the challenges faced by farmers. Also covers historical development and the relationship between agriculture and other subjects.', NULL, NULL, 1, '2025-09-09T06:29:29.546Z'),
  ('topic-agri-f1-crop1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Crop Production I', 'Explains the processes involved in crop production, from land preparation and planting to harvesting and marketing.', NULL, NULL, 4, '2025-09-09T06:29:29.691Z'),
  ('topic-agri-f2-economics1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Agricultural Economics I', 'Explains basic economic concepts in agriculture, such as land tenure, farm records, and marketing.', NULL, NULL, 3, '2025-09-09T06:29:29.834Z'),
  ('topic-chem-f1-classify', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Simple Classification of Substances', NULL, NULL, NULL, 2, '2025-09-09T06:29:20.598Z'),
  ('topic-chem-f2-atom', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Structure of the Atom and The Periodic Table', NULL, NULL, NULL, 6, '2025-09-09T06:29:20.791Z'),
  ('topic-chem-f2-families', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Chemical Families', NULL, NULL, NULL, 7, '2025-09-09T06:29:20.839Z'),
  ('topic-chem-f3-mole', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'The Mole and Chemical Equations', NULL, NULL, NULL, 11, '2025-09-09T06:29:21.033Z'),
  ('topic-chem-f3-gas', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Gas Laws', NULL, NULL, NULL, 12, '2025-09-09T06:29:21.081Z'),
  ('topic-chem-f4-acids-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Acids, Bases, and Salts (Revision & Expansion)', NULL, NULL, NULL, 17, '2025-09-09T06:29:21.320Z'),
  ('topic-chem-f4-energy-v2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '18c89482-24b4-400f-af4f-f9616ae884c2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Energy Changes in Chemical and Physical Processes', NULL, NULL, NULL, 18, '2025-09-09T06:29:21.371Z'),
  ('topic-comp-f4-impact', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Impact of ICT on Society', 'Discusses the positive and negative effects of computers on society, including issues related to ethics, privacy, and health.', NULL, NULL, 3, '2025-09-09T06:29:29.404Z'),
  ('topic-agri-f1-factors', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Factors Influencing Agriculture', 'Examines the various ecological (e.g., climate, soil, pests) and economic (e.g., market, transport, capital) factors that influence agricultural production.', NULL, NULL, 2, '2025-09-09T06:29:29.596Z'),
  ('topic-agri-f1-tools', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Tools and Equipment', 'Covers the identification, uses, and maintenance of various hand tools and equipment used in farming.', NULL, NULL, 3, '2025-09-09T06:29:29.644Z'),
  ('topic-agri-f3-livestock2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Livestock Production II', 'Covers advanced topics in livestock production, including nutrition, breeding, and disease control.', NULL, NULL, 2, '2025-09-09T06:29:29.976Z'),
  ('topic-agri-f4-structures', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Agricultural Structures', 'Discusses the construction and maintenance of farm structures like fences, barns, and animal housing.', NULL, NULL, 3, '2025-09-09T06:29:30.166Z'),
  ('topic-comp-f4-careers', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Careers in ICT', 'Identifies various career opportunities in the field of ICT and the skills required for each.', NULL, NULL, 4, '2025-09-09T06:29:29.451Z'),
  ('topic-comp-f4-project', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Computer Project', 'This is a practical project where students apply the skills and knowledge acquired throughout the course to develop a complete system, from analysis to implementation.', NULL, NULL, 5, '2025-09-09T06:29:29.499Z'),
  ('topic-agri-f2-crop2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Crop Production II', 'Expands on Form 1 topics, focusing on specific crops like maize, wheat, and coffee, and their cultivation practices.', NULL, NULL, 4, '2025-09-09T06:29:29.882Z'),
  ('topic-agri-f3-economics2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Agricultural Economics II', 'Deals with advanced agricultural economics, including farm planning, budgeting, and sources of agricultural finance.', NULL, NULL, 3, '2025-09-09T06:29:30.024Z'),
  ('topic-phys-f2-magnetism', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Magnetism', 'Properties of magnets, magnetic fields, and the process of magnetization and demagnetization.', NULL, NULL, 1, '2025-09-09T06:29:22.169Z'),
  ('topic-phys-f2-measurements2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Measurements II', 'Learning to use more precise measuring instruments like the Vernier caliper and micrometer screw gauge.', NULL, NULL, 2, '2025-09-09T06:29:22.217Z'),
  ('topic-phys-f2-moments', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Turning Effect of a Force', 'Introduces the concept of moments and the principle of moments, with applications in levers.', NULL, NULL, 3, '2025-09-09T06:29:22.265Z'),
  ('topic-phys-f2-equilibrium', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Equilibrium and Centre of Gravity', 'Explains different states of equilibrium and how the position of the center of gravity affects the stability of an object.', NULL, NULL, 4, '2025-09-09T06:29:22.314Z'),
  ('topic-phys-f3-motion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Linear Motion', 'Deals with the motion of objects in a straight line, including concepts like displacement, velocity, acceleration, and the equations of motion.', NULL, NULL, 1, '2025-09-09T06:29:22.650Z'),
  ('topic-phys-f3-newton', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Newton''s Laws of Motion', 'Covers Newton''s three laws of motion and their applications in everyday life.', NULL, NULL, 2, '2025-09-09T06:29:22.697Z'),
  ('topic-phys-f3-energy', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Work, Energy, Power and Machines', 'Explains the concepts of work, energy (kinetic and potential), and power. Also covers the study of simple machines.', NULL, NULL, 3, '2025-09-09T06:29:22.746Z'),
  ('topic-phys-f4-lenses', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Thin Lenses', 'Covers image formation by concave and convex lenses, including the lens formula and linear magnification.', NULL, NULL, 1, '2025-09-09T06:29:23.125Z'),
  ('topic-phys-f4-circular', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Uniform Circular Motion', 'Explains motion in a circle, including centripetal force and centripetal acceleration.', NULL, NULL, 2, '2025-09-09T06:29:23.174Z'),
  ('topic-phys-f4-floating', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Floating and Sinking', 'Revisits pressure in fluids, focusing on the principles of floatation and Archimedes'' principle.', NULL, NULL, 3, '2025-09-09T06:29:23.223Z'),
  ('topic-bio-f2-respiration', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Respiration', 'Defines respiration, its importance, and the different types of respiration (aerobic and anaerobic) in living organisms.', NULL, NULL, 1, '2025-09-09T06:29:24.002Z'),
  ('topic-bio-f2-excretion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Excretion and Homeostasis', 'Covers the removal of metabolic waste products from the body (excretion) and the maintenance of a constant internal environment (homeostasis).', NULL, NULL, 2, '2025-09-09T06:29:24.051Z'),
  ('topic-bio-f3-ecology', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Ecology', 'Studies the relationship between living organisms and their environment, including ecosystems, energy flow, and nutrient cycling.', NULL, NULL, 1, '2025-09-09T06:29:24.242Z'),
  ('topic-bio-f4-support', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Support and Movement in Plants and Animals', 'Covers the various types of support systems in plants and animals, and the mechanisms of movement, including the human skeleton.', NULL, NULL, 1, '2025-09-09T06:29:24.481Z'),
  ('topic-bio-f4-coordination', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'e391687a-3d73-447f-8942-28b4d9f0f33c', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Coordination and Response in Animals', 'Details the nervous and endocrine systems in animals, and how they work together to coordinate responses to stimuli.', NULL, NULL, 2, '2025-09-09T06:29:24.527Z'),
  ('topic-math-f2-geometry2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Geometry II', 'Expands on Form 1 geometry, covering properties of triangles, quadrilaterals, and other polygons. Also includes angle properties of parallel lines.', NULL, NULL, 1, '2025-09-09T06:29:25.153Z'),
  ('topic-math-f2-measurements2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Measurements II', 'Focuses on the area of curved surfaces and the volume of cones, cylinders, and pyramids.', NULL, NULL, 2, '2025-09-09T06:29:25.201Z'),
  ('topic-math-f2-algebra2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Algebra II', 'Covers algebraic expressions and formulas, factorization of quadratic expressions, and solving linear inequalities.', NULL, NULL, 3, '2025-09-09T06:29:25.248Z'),
  ('topic-math-f3-quadratic', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Quadratic Equations', 'Solving quadratic equations using factorization, completing the square, and the quadratic formula.', NULL, NULL, 1, '2025-09-09T06:29:25.485Z'),
  ('topic-math-f3-approximation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Approximation and Errors', 'Discusses rounding off numbers and calculating absolute and relative errors. Includes the concept of error propagation.', NULL, NULL, 2, '2025-09-09T06:29:25.533Z'),
  ('topic-math-f4-trigonometry2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Trigonometry II', 'Expands on Form 3, covering trigonometric identities, graphs of trigonometric functions, and solving trigonometric equations.', NULL, NULL, 1, '2025-09-09T06:29:25.819Z'),
  ('topic-math-f4-vectors2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Vectors II', 'Focuses on column vectors and their use in transformations. Includes applications in geometry.', NULL, NULL, 2, '2025-09-09T06:29:25.867Z'),
  ('topic-math-f4-matrices', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Matrices and Transformations', 'Introduces matrices, their operations, and their use in representing linear transformations like translation, rotation, and reflection.', NULL, NULL, 3, '2025-09-09T06:29:25.913Z'),
  ('topic-hist-f2-citizenship', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Citizenship', 'Defines citizenship, different types of citizenship, and the rights and responsibilities of a Kenyan citizen.', NULL, NULL, 1, '2025-09-09T06:29:26.444Z'),
  ('topic-hist-f2-integration', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'National Integration', 'Explores the meaning of national integration, factors that promote and hinder it, and strategies for fostering national unity in Kenya.', NULL, NULL, 2, '2025-09-09T06:29:26.492Z'),
  ('topic-hist-f3-invasion', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'European Invasion of Africa and the Process of Colonisation', 'Examines the scramble for and partitioning of Africa, the reasons for European invasion, and the methods of colonial conquest.', NULL, NULL, 1, '2025-09-09T06:29:26.736Z'),
  ('topic-hist-f3-colonial-rule', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Establishment of Colonial Rule in Kenya', 'Details the establishment of British colonial administration in Kenya, including the role of the Imperial British East Africa Company (IBEACo).', NULL, NULL, 2, '2025-09-09T06:29:26.784Z'),
  ('topic-hist-f4-world-wars', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'World Wars', 'Covers the causes, events, and results of the First and Second World Wars, and their global impact.', NULL, NULL, 1, '2025-09-09T06:29:27.070Z'),
  ('topic-hist-f4-international', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'International Relations', 'Explores the concept of international relations, including the formation and functions of international organizations like the United Nations (UN).', NULL, NULL, 2, '2025-09-09T06:29:27.118Z'),
  ('topic-hist-f4-cooperation', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Co-operation in Africa', 'Discusses the history of Pan-Africanism and the role of regional and continental bodies like the Organization of African Unity (OAU) and the African Union (AU).', NULL, NULL, 3, '2025-09-09T06:29:27.166Z'),
  ('topic-bus-f2-home-trade', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Home Trade', 'Examines the different types of retail and wholesale trade, channels of distribution, and factors influencing home trade.', NULL, NULL, 1, '2025-09-09T06:29:27.737Z'),
  ('topic-bus-f2-forms', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Forms of Business Units', 'Covers the different forms of business ownership, including sole proprietorships, partnerships, and companies, and their advantages and disadvantages.', NULL, NULL, 2, '2025-09-09T06:29:27.785Z'),
  ('topic-bus-f3-demand-supply', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Demand and Supply', 'Explains the concepts of demand and supply, the law of demand and supply, and how equilibrium price is determined.', NULL, NULL, 1, '2025-09-09T06:29:28.071Z'),
  ('topic-bus-f3-size-location', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Size and Location of a Firm', 'Covers the factors that influence the size and location of a business, as well as the concepts of economies and diseconomies of scale.', NULL, NULL, 2, '2025-09-09T06:29:28.118Z'),
  ('topic-bus-f4-documents', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Source Documents and Books of Original Entry', 'A more detailed look at business documents and their use in accounting, including ledgers and cash books.', NULL, NULL, 1, '2025-09-09T06:29:28.404Z'),
  ('topic-bus-f4-statements', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Financial Statements', 'Focuses on the preparation and analysis of financial statements, including the Trading, Profit and Loss account, and Balance Sheet.', NULL, NULL, 2, '2025-09-09T06:29:28.451Z'),
  ('topic-comp-f3-data-rep', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Data Representation in a Computer', 'Explains how data is represented in a computer using binary digits. Includes different number systems (binary, decimal, octal, hexadecimal) and binary arithmetic operations.', NULL, NULL, 1, '2025-09-09T06:29:29.119Z'),
  ('topic-comp-f4-networking', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Networking and Data Communication', 'Explains the concepts of computer networks, types of networks (LAN, MAN, WAN), network topologies, and the benefits and limitations of networking.', NULL, NULL, 1, '2025-09-09T06:29:29.308Z'),
  ('topic-agri-f2-soil1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Soil Fertility I', 'Introduces the concept of soil fertility, the components of soil, and methods of maintaining and improving soil fertility.', NULL, NULL, 1, '2025-09-09T06:29:29.739Z'),
  ('topic-agri-f2-livestock1', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '60190057-a240-4429-b2a5-f770958d3865', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Livestock Production I', 'Covers the common livestock in Kenya, including cattle, poultry, and goats. Students learn about different breeds and their general management.', NULL, NULL, 2, '2025-09-09T06:29:29.786Z'),
  ('topic-agri-f3-soil2', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Soil Fertility II', 'A more detailed look at soil fertility, including soil conservation, manuring, and the use of fertilizers.', NULL, NULL, 1, '2025-09-09T06:29:29.929Z'),
  ('topic-agri-f4-pests', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Pests and Diseases of Crops', 'Covers the identification of common crop pests and diseases and their control methods. Includes both chemical and non-chemical methods.', NULL, NULL, 1, '2025-09-09T06:29:30.072Z'),
  ('topic-agri-f4-weeds', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '4f203b72-a622-40f0-8d13-b7cf5ef6c284', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '05408d45-33aa-421e-96b6-3ebfb59505b7', 'Weeds', 'Explains the types of weeds, their effects, and the various methods of weed control.', NULL, NULL, 2, '2025-09-09T06:29:30.118Z'),
  ('topic-math-f1-ratio', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Ratio, Proportion, and Rate', 'Explains the concepts of ratio, direct and inverse proportion, and rate. Includes practical applications like currency exchange rates.', NULL, NULL, 5, '2025-09-09T06:29:24.961Z'),
  ('topic-math-f1-percentages', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '547ffc3a-b94d-4010-b5fd-b65773c12328', 'bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Percentages', 'Covers percentage increase and decrease, profit and loss, and simple interest.', NULL, NULL, 6, '2025-09-09T06:29:25.009Z'),
  ('topic-bus-f3-distribution', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'The Chain of Distribution', 'Discusses the various channels through which goods move from producers to consumers, including the roles of intermediaries.', NULL, NULL, 4, '2025-09-09T06:29:28.213Z'),
  ('topic-comp-f4-applications', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '9fd192de-ef62-4e53-8f0a-bcfef16d6cb0', '52b4a255-8747-4e3a-a4e9-392b63cca41b', 'Application Areas of ICT', 'Covers the use of Information and Communication Technology (ICT) in various sectors like education, business, transport, and law enforcement.', NULL, NULL, 2, '2025-09-09T06:29:29.356Z'),
  ('topic-phys-f3-heating', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Heating Effect of an Electric Current', 'Focuses on the relationship between electrical energy and heat energy, including the formula H = I²Rt.', NULL, NULL, 7, '2025-09-09T06:29:22.935Z'),
  ('topic-phys-f3-heat-quantity', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Quantity of Heat', 'Deals with calculating heat changes, including specific heat capacity and specific latent heat.', NULL, NULL, 8, '2025-09-09T06:29:22.983Z'),
  ('topic-phys-f3-refraction', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Refraction of Light', 'Covers the bending of light as it passes between different media, including Snell''s Law and total internal reflection.', NULL, NULL, 9, '2025-09-09T06:29:23.030Z'),
  ('topic-phys-f3-gas', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'eb371e93-ddef-421e-9ff9-05b36a454e12', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Gas Laws', 'Studies the relationships between pressure, volume, and temperature for gases.', NULL, NULL, 10, '2025-09-09T06:29:23.078Z'),
  ('topic-hist-f3-independence', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Political Developments and the Struggle for Independence in Kenya (1919-1963)', 'Explores the rise of African nationalism and the various political struggles that led to Kenya''s independence.', NULL, NULL, 5, '2025-09-09T06:29:26.926Z'),
  ('topic-hist-f3-leaders', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Lives and Contributions of Kenyan Leaders', 'Examines the roles and contributions of key Kenyan leaders who fought for independence and built the nation.', NULL, NULL, 6, '2025-09-09T06:29:26.974Z'),
  ('topic-hist-f3-government', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '2e17eb44-e3ea-4e0e-a0d3-1e1825a04596', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'The Formation, Structure, and Functions of the Government of Kenya', 'Introduces students to the three arms of government: the legislature, the executive, and the judiciary.', NULL, NULL, 7, '2025-09-09T06:29:27.023Z'),
  ('topic-bus-f2-insurance', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Insurance', 'Introduces the concept of insurance, principles of insurance, and different classes of insurance policies.', NULL, NULL, 7, '2025-09-09T06:29:28.023Z'),
  ('topic-bus-f3-national-income', 'bde2015e-8e30-4460-ad2b-c79837d9438b', 'c0ead570-cd77-4b08-be0e-608ac87fe7c7', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'National Income', 'Introduces the concept of national income, its measurement, and the factors affecting it.', NULL, NULL, 5, '2025-09-09T06:29:28.260Z'),
  ('topic-comp-f2-internet', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', '60190057-a240-4429-b2a5-f770958d3865', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Internet and E-mail', 'Covers the history and development of the internet, its importance, and how to use internet services like web browsing and e-mail.', NULL, NULL, 5, '2025-09-09T06:29:29.073Z'),
  ('topic-comp-f3-programming', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'Elementary Programming Principles', 'Introduces programming concepts, levels of programming languages, and program development. Includes designing algorithms using flowcharts and pseudocode.', NULL, NULL, 3, '2025-09-09T06:29:29.213Z'),
  ('topic-comp-f3-system-dev', 'bde2015e-8e30-4460-ad2b-c79837d9438b', '0b2d3407-3fc3-49e6-b652-1e6917e2ead2', 'c03f9705-e64b-438d-af6e-4e4b0f2e8093', '99f82484-1bee-4fae-b2a1-cd33c223874f', 'System Development', 'Covers the concept of a system, information systems, and the stages of the System Development Life Cycle (SDLC).', NULL, NULL, 4, '2025-09-09T06:29:29.260Z');

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


-- Table: user_badges (6 rows)
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

INSERT INTO "user_badges" ("id", "user_id", "badge_id", "count", "streaks", "last_earned_at", "created_at", "updated_at") VALUES
  ('82c50955-4d9a-49c3-8fcf-188e0fc2b320', 'demo-student-1', 'daily-fire', 1, 2, '2025-08-20T16:37:50.194Z', '2025-09-09T06:31:42.197Z', '2025-09-09T06:31:42.197Z'),
  ('27d26da4-b7c0-4a69-850a-00c10ac1c7b9', 'demo-student-1', 'spark-badge', 1, 1, '2025-08-20T16:37:50.194Z', '2025-09-09T06:31:42.249Z', '2025-09-09T06:31:42.249Z'),
  ('b877fd3b-3230-4f22-8fa7-09ae8f9df136', '37410516', 'daily-fire', 5, 0, '2025-08-20T16:38:03.872Z', '2025-09-09T06:31:42.296Z', '2025-09-09T06:31:42.296Z'),
  ('ba306f80-8461-49ad-9e12-fea85718d85e', '37410516', 'streak-warrior', 2, 0, '2025-08-20T16:38:03.872Z', '2025-09-09T06:31:42.345Z', '2025-09-09T06:31:42.345Z'),
  ('0b08a09f-7f9e-460c-aab0-938c02e500cf', '936850c0-162a-4336-806c-c374a9b59952', 'spark-collector', 7, 0, '2025-09-11T15:35:46.726Z', '2025-09-11T09:46:11.200Z', '2025-09-11T15:35:46.726Z'),
  ('4af495b0-edd1-4254-896b-31c2d0c49a54', '936850c0-162a-4336-806c-c374a9b59952', 'daily-fire', 4, 0, '2025-09-11T15:35:46.769Z', '2025-09-09T21:17:31.414Z', '2025-09-11T15:35:46.769Z');

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


-- Table: user_challenges (5 rows)
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS "user_challenges" (
  "id" CHARACTER VARYING NOT NULL DEFAULT gen_random_uuid(),
  "user_id" CHARACTER VARYING NOT NULL,
  "challenge_id" CHARACTER VARYING NOT NULL,
  "completed" BOOLEAN DEFAULT false,
  "progress" INTEGER DEFAULT 0,
  "sparks_awarded" BOOLEAN DEFAULT false,
  "completed_at" TIMESTAMP WITHOUT TIME ZONE,
  "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

INSERT INTO "user_challenges" ("id", "user_id", "challenge_id", "completed", "progress", "sparks_awarded", "completed_at", "created_at", "updated_at") VALUES
  ('b500d182-c2b6-4276-95c2-fb36a37fe495', 'demo-student-1', 'daily-50-sparks', FALSE, 0, FALSE, NULL, '2025-09-09T06:31:41.905Z', '2025-09-09T06:31:41.905Z'),
  ('130aadfc-d379-4241-b41e-5444599e63b9', 'demo-student-1', 'weekly-top5', FALSE, 0, FALSE, NULL, '2025-09-09T06:31:41.957Z', '2025-09-09T06:31:41.957Z'),
  ('e7affaf1-90bb-49ab-9eba-78bfa67a9cfd', 'demo-student-1', 'quiz-streak-7', FALSE, 0, FALSE, NULL, '2025-09-09T06:31:42.004Z', '2025-09-09T06:31:42.004Z'),
  ('549f1205-bb82-4423-99b5-5da20a25e1e1', 'demo-student-1', 'spark-collector-100', FALSE, 0, FALSE, NULL, '2025-09-09T06:31:42.051Z', '2025-09-09T06:31:42.051Z'),
  ('ca476342-2bda-4e03-8d5a-c49ed1622121', 'demo-student-1', 'spark-collection', FALSE, 750, FALSE, NULL, '2025-09-09T06:31:42.098Z', '2025-09-09T06:31:42.098Z');

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
  ('b6d37e6c-fbf2-46c6-9354-315a9a002c52', '936850c0-162a-4336-806c-c374a9b59952', '1', 'active', '2025-09-09T06:51:05.853Z', '2025-10-09T06:51:05.853Z', TRUE, 'paystack', NULL, NULL, '2025-09-09T06:51:05.872Z', '2025-09-09T06:51:05.872Z');

ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");


-- Table: user_trophies (2 rows)
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

INSERT INTO "user_trophies" ("id", "user_id", "trophy_id", "count", "last_earned_at", "created_at", "updated_at") VALUES
  ('25dcbfb3-f0c1-4aae-8a33-5e2acf69820f', '37410516', 'bronze-trophy', 3, '2025-08-20T16:36:37.355Z', '2025-09-09T06:31:42.439Z', '2025-09-09T06:31:42.439Z'),
  ('974cea24-b071-40c8-a674-140ba873e5c2', '37410516', 'silver-trophy', 1, '2025-08-20T16:36:37.355Z', '2025-09-09T06:31:42.493Z', '2025-09-09T06:31:42.493Z');

ALTER TABLE "user_trophies" ADD CONSTRAINT "user_trophies_pkey" PRIMARY KEY ("id");


-- Table: users (15 rows)
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
  ('47111790', 'snappylearn@gmail.com', NULL, 'Snappylearn', 'Platform', NULL, 'c9e0304e-f77a-4d46-be50-b6d6fec66f49', FALSE, '0.00', TRUE, FALSE, FALSE, NULL, '2025-09-09T06:28:39.819Z', '2025-09-11T11:30:23.621Z');

ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


SET session_replication_role = DEFAULT;

-- Export completed
