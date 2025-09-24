--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.admin_sessions OWNER TO neondb_owner;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    role character varying DEFAULT 'admin'::character varying,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_users OWNER TO neondb_owner;

--
-- Name: badge_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.badge_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.badge_types OWNER TO neondb_owner;

--
-- Name: badges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.badges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    sparks integer,
    icon character varying,
    badge_type_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.badges OWNER TO neondb_owner;

--
-- Name: challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.challenges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    sparks integer DEFAULT 0,
    streaks integer DEFAULT 0,
    badge_id character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.challenges OWNER TO neondb_owner;

--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.credit_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    payment_transaction_id character varying,
    balance_before numeric(10,2) NOT NULL,
    balance_after numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.credit_transactions OWNER TO neondb_owner;

--
-- Name: daily_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_challenges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    date character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    target_value integer NOT NULL,
    sparks_reward integer DEFAULT 200,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.daily_challenges OWNER TO neondb_owner;

--
-- Name: enhanced_quiz_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.enhanced_quiz_sessions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quiz_id character varying NOT NULL,
    user_id character varying NOT NULL,
    profile_id character varying NOT NULL,
    examination_system_id character varying NOT NULL,
    level_id character varying NOT NULL,
    subject_id character varying NOT NULL,
    quiz_questions jsonb NOT NULL,
    start_time timestamp without time zone DEFAULT now(),
    end_time timestamp without time zone,
    total_questions integer NOT NULL,
    correct_answers integer DEFAULT 0,
    total_marks integer DEFAULT 0,
    marks_obtained integer DEFAULT 0,
    sparks_earned integer DEFAULT 0,
    accuracy_percentage integer DEFAULT 0,
    time_spent integer,
    completed boolean DEFAULT false,
    can_retake boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.enhanced_quiz_sessions OWNER TO neondb_owner;

--
-- Name: examination_systems; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.examination_systems (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    description text,
    country character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.examination_systems OWNER TO neondb_owner;

--
-- Name: general_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.general_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    platform_name character varying DEFAULT 'Daily Sparks'::character varying NOT NULL,
    tagline character varying DEFAULT 'TikTok Simple, Harvard Smart'::character varying,
    primary_color character varying DEFAULT '#3b82f6'::character varying,
    secondary_color character varying DEFAULT '#1e40af'::character varying,
    accent_color character varying DEFAULT '#f59e0b'::character varying,
    logo_url character varying,
    favicon_url character varying,
    support_email character varying DEFAULT 'support@dailysparks.com'::character varying,
    maintenance_mode boolean DEFAULT false,
    max_users integer DEFAULT 10000,
    timezone character varying DEFAULT 'Africa/Nairobi'::character varying,
    language character varying DEFAULT 'en'::character varying,
    updated_at timestamp without time zone DEFAULT now(),
    updated_by character varying
);


ALTER TABLE public.general_settings OWNER TO neondb_owner;

--
-- Name: levels; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.levels (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    examination_system_id character varying NOT NULL,
    "order" integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.levels OWNER TO neondb_owner;

--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notification_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email_notifications_enabled boolean DEFAULT true,
    daily_reminder_enabled boolean DEFAULT true,
    daily_reminder_time character varying DEFAULT '18:00'::character varying,
    streak_reminder_enabled boolean DEFAULT true,
    achievement_notifications_enabled boolean DEFAULT true,
    leaderboard_updates_enabled boolean DEFAULT true,
    weekly_progress_report_enabled boolean DEFAULT true,
    weekly_progress_report_day integer DEFAULT 0,
    challenge_notifications_enabled boolean DEFAULT true,
    spark_boost_notifications_enabled boolean DEFAULT true,
    maintenance_notifications_enabled boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT now(),
    updated_by character varying
);


ALTER TABLE public.notification_settings OWNER TO neondb_owner;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.password_reset_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.password_reset_tokens OWNER TO neondb_owner;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'KES'::character varying,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    description text,
    plan_id character varying,
    paystack_reference character varying,
    paystack_transaction_id character varying,
    subscription_id character varying,
    metadata jsonb,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payment_transactions OWNER TO neondb_owner;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    examination_system_id character varying NOT NULL,
    level_id character varying NOT NULL,
    current_term character varying DEFAULT 'Term 1'::character varying,
    sparks integer DEFAULT 0,
    streak integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    rank integer,
    last_quiz_date timestamp without time zone,
    last_activity timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.profiles OWNER TO neondb_owner;

--
-- Name: question_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.question_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    code character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.question_types OWNER TO neondb_owner;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    topic_id character varying,
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    correct_answer character varying NOT NULL,
    explanation text,
    difficulty character varying DEFAULT 'medium'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: quiz_question_answers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_question_answers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quiz_session_id character varying NOT NULL,
    quiz_question_id character varying NOT NULL,
    quiz_question_choice_id character varying,
    answer text,
    is_correct boolean NOT NULL,
    marks integer DEFAULT 0,
    sparks integer DEFAULT 0,
    time_spent integer,
    answered_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_question_answers OWNER TO neondb_owner;

--
-- Name: quiz_question_choices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_question_choices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quiz_question_id character varying NOT NULL,
    content text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_question_choices OWNER TO neondb_owner;

--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_questions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quiz_id character varying NOT NULL,
    content text NOT NULL,
    question_type_id character varying NOT NULL,
    marks integer DEFAULT 1 NOT NULL,
    difficulty character varying DEFAULT 'medium'::character varying NOT NULL,
    explanation text,
    order_index integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_questions OWNER TO neondb_owner;

--
-- Name: quiz_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_sessions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    profile_id character varying NOT NULL,
    subject_id character varying NOT NULL,
    quiz_type character varying NOT NULL,
    topic_id character varying,
    term_id character varying,
    quiz_questions jsonb,
    total_questions integer DEFAULT 30,
    current_question_index integer DEFAULT 0,
    correct_answers integer DEFAULT 0,
    sparks_earned integer DEFAULT 0,
    time_spent integer,
    completed boolean DEFAULT false,
    started_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


ALTER TABLE public.quiz_sessions OWNER TO neondb_owner;

--
-- Name: quiz_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sparks_per_correct_answer integer DEFAULT 5 NOT NULL,
    accuracy_bonus_threshold numeric(3,2) DEFAULT 0.80,
    accuracy_bonus_multiplier numeric(3,2) DEFAULT 1.50,
    good_accuracy_threshold numeric(3,2) DEFAULT 0.60,
    good_accuracy_multiplier numeric(3,2) DEFAULT 1.20,
    max_questions_per_quiz integer DEFAULT 15,
    min_questions_per_quiz integer DEFAULT 5,
    time_per_question_seconds integer DEFAULT 45,
    allow_skip_questions boolean DEFAULT false,
    show_correct_answers boolean DEFAULT true,
    show_explanations boolean DEFAULT true,
    randomize_questions boolean DEFAULT true,
    randomize_options boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT now(),
    updated_by character varying
);


ALTER TABLE public.quiz_settings OWNER TO neondb_owner;

--
-- Name: quiz_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    code character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_types OWNER TO neondb_owner;

--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quizzes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    examination_system_id character varying NOT NULL,
    level_id character varying NOT NULL,
    subject_id character varying NOT NULL,
    quiz_type character varying NOT NULL,
    topic_id character varying,
    term_id character varying,
    questions jsonb NOT NULL,
    total_questions integer NOT NULL,
    time_limit integer NOT NULL,
    difficulty character varying DEFAULT 'medium'::character varying,
    is_active boolean DEFAULT true,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quizzes OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subjects (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    examination_system_id character varying NOT NULL,
    icon character varying,
    color character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subjects OWNER TO neondb_owner;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscription_plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'KES'::character varying,
    billing_cycle character varying DEFAULT 'weekly'::character varying,
    daily_quiz_limit integer,
    question_bank_size integer,
    features jsonb,
    has_ai_personalization boolean DEFAULT false,
    support_level character varying DEFAULT 'basic'::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscription_plans OWNER TO neondb_owner;

--
-- Name: terms; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.terms (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    examination_system_id character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.terms OWNER TO neondb_owner;

--
-- Name: topics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.topics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    examination_system_id character varying NOT NULL,
    subject_id character varying NOT NULL,
    level_id character varying NOT NULL,
    term_id character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    summary_content text,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.topics OWNER TO neondb_owner;

--
-- Name: trophies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.trophies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    icon character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.trophies OWNER TO neondb_owner;

--
-- Name: user_answers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_answers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quiz_session_id character varying NOT NULL,
    question_id character varying NOT NULL,
    user_answer character varying NOT NULL,
    is_correct boolean NOT NULL,
    time_spent integer,
    answered_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_answers OWNER TO neondb_owner;

--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_badges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    badge_id character varying NOT NULL,
    count integer DEFAULT 1,
    streaks integer DEFAULT 0,
    last_earned_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_badges OWNER TO neondb_owner;

--
-- Name: user_challenge_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_challenge_progress (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    profile_id character varying NOT NULL,
    challenge_id character varying NOT NULL,
    current_value integer DEFAULT 0,
    completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_challenge_progress OWNER TO neondb_owner;

--
-- Name: user_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_challenges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    challenge_id character varying NOT NULL,
    completed boolean DEFAULT false,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_challenges OWNER TO neondb_owner;

--
-- Name: user_preference_changes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_preference_changes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    profile_id character varying NOT NULL,
    change_type character varying NOT NULL,
    previous_value character varying,
    new_value character varying NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


ALTER TABLE public.user_preference_changes OWNER TO neondb_owner;

--
-- Name: user_spark_boost; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_spark_boost (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    from_user_id character varying NOT NULL,
    to_user_id character varying NOT NULL,
    sparks integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_spark_boost OWNER TO neondb_owner;

--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    auto_renew boolean DEFAULT true,
    payment_method character varying,
    paystack_customer_code character varying,
    paystack_subscription_code character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_subscriptions OWNER TO neondb_owner;

--
-- Name: user_trophies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_trophies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    trophy_id character varying NOT NULL,
    count integer DEFAULT 1,
    last_earned_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_trophies OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    default_profile_id character varying,
    is_premium boolean DEFAULT false,
    credits numeric(10,2) DEFAULT 0.00,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    needs_password_setup boolean DEFAULT false,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_users (id, email, password, first_name, last_name, role, is_active, last_login_at, created_at, updated_at) FROM stdin;
4938b6f3-3af2-434c-b39a-192af2ad0abc	dailysparks@admin.com	a7465e1cf532d592693067c80f8a1c0849c8df6dbb4c09f79d212fcdc9429943540bb1c69329c600e4b970c3861f85939549821da01393ea13afc5d1d84d447b.6c5044e024d5b4363f6d6a2fd071a4ee	Daily	Sparks Admin	super_admin	t	2025-09-11 11:19:38.495	2025-09-09 07:01:16.129	2025-09-11 11:19:38.495
6c77ade6-8784-4a33-a73c-11fb58d066ac	admin@dailysparks.com	2b3cba30f0f51cd0bd9990bd32e150d36fe28e3c35ba1936ca34e0985aeb0b5a0790642059259d0c3425dc6eb4421377c53f477dc281f68fa93bef8b11278931.a478db7120bf47fe7bd843f66b6d9abb	Admin	User	super_admin	t	2025-09-24 12:45:26.623	2025-09-02 17:22:39.67	2025-09-24 12:45:26.623
\.


--
-- Data for Name: badge_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.badge_types (id, title, description, created_at) FROM stdin;
spark-badge-type	Spark Badge	Badges for earning sparks	2025-09-09 06:31:40.753
streak-badge-type	Streak Badge	Badges for maintaining streaks	2025-09-09 06:31:40.808
weekly-badge-type	Weekly Badge	Badges for weekly achievements	2025-09-09 06:31:40.855
daily-badge-type	Daily Badge	Badges for daily achievements	2025-09-09 06:31:40.901
spark-type	Spark Badges	Badges earned through collecting sparks	2025-09-09 06:31:40.947
streak-type	Streak Badges	Badges earned through maintaining streaks	2025-09-09 06:31:40.993
achievement-type	Achievement Badges	Special achievement badges	2025-09-09 06:31:41.04
daily-type	Daily Badges	Daily activity badges	2025-09-09 06:31:41.085
\.


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.badges (id, title, description, sparks, icon, badge_type_id, created_at) FROM stdin;
spark-collector	Spark Collector	Earned 100 sparks	10	⚡	spark-badge-type	2025-09-09 06:31:41.132
streak-warrior	Streak Warrior	Maintained 7-day streak	20	🔥	streak-badge-type	2025-09-09 06:31:41.182
daily-fire	Daily Fire Badge	Earned 50 sparks in a single day	25	🔥	daily-badge-type	2025-09-09 06:31:41.229
quiz-master	Quiz Master	Completed 10 quizzes	30	🏆	spark-badge-type	2025-09-09 06:31:41.276
spark-badge	Spark Collector	Earned by collecting sparks	100	⚡	spark-type	2025-09-09 06:31:41.322
streak-badge	Streak Master	Earned by maintaining learning streaks	150	🔥	streak-type	2025-09-09 06:31:41.369
weekly-warrior	Weekly Warrior	Earned by maintaining top 5 rank for 3 days	300	⚔️	achievement-type	2025-09-09 06:31:41.415
\.


--
-- Data for Name: challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.challenges (id, title, description, sparks, streaks, badge_id, is_active, created_at, updated_at) FROM stdin;
daily-50-sparks	Daily Spark Hunter	Earn 50 sparks today	10	1	daily-fire	t	2025-09-09 06:31:41.62	2025-09-09 06:31:41.62
spark-collector-100	Spark Collector Challenge	Earn 100 total sparks	50	0	spark-collector	t	2025-09-09 06:31:41.67	2025-09-09 06:31:41.67
spark-collection	Collect 1000 sparks	Accumulate 1000 total sparks from quizzes	300	0	spark-badge	t	2025-09-09 06:31:41.718	2025-09-09 06:31:41.718
weekly-top5	Weekly Champion	Maintain Top 5 rank for 3 days	100	5	weekly-warrior	f	2025-09-09 06:31:41.764	2025-09-09 06:31:41.764
quiz-streak-7	Quiz Streak Master	Complete quizzes for 7 consecutive days	75	7	streak-warrior	f	2025-09-09 06:31:41.81	2025-09-09 06:31:41.81
\.


--
-- Data for Name: credit_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.credit_transactions (id, user_id, type, amount, description, payment_transaction_id, balance_before, balance_after, created_at) FROM stdin;
\.


--
-- Data for Name: daily_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.daily_challenges (id, date, title, description, target_value, sparks_reward, created_at) FROM stdin;
\.


--
-- Data for Name: enhanced_quiz_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.enhanced_quiz_sessions (id, quiz_id, user_id, profile_id, examination_system_id, level_id, subject_id, quiz_questions, start_time, end_time, total_questions, correct_answers, total_marks, marks_obtained, sparks_earned, accuracy_percentage, time_spent, completed, can_retake, created_at) FROM stdin;
\.


--
-- Data for Name: examination_systems; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.examination_systems (id, name, code, description, country, is_active, created_at) FROM stdin;
bde2015e-8e30-4460-ad2b-c79837d9438b	Kenya Certificate of Secondary Education	KCSE	The national secondary school leaving examination in Kenya	Kenya	t	2025-09-09 06:28:37.711
3c091257-02e2-4f0c-9adf-4233db6c7f1f	International General Certificate of Secondary Education	IGCSE	International qualification for secondary school students	International	t	2025-09-09 06:28:37.769
55d91204-9e44-4c9f-8497-fb61a4e4a661	Kenya Primary School Education Assessment	KPSEA	Primary school assessment system in Kenya	Kenya	t	2025-09-09 06:28:37.814
\.


--
-- Data for Name: general_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.general_settings (id, platform_name, tagline, primary_color, secondary_color, accent_color, logo_url, favicon_url, support_email, maintenance_mode, max_users, timezone, language, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: levels; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.levels (id, title, description, examination_system_id, "order", is_active, created_at) FROM stdin;
bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Form 1	First year of secondary education	bde2015e-8e30-4460-ad2b-c79837d9438b	1	t	2025-09-09 06:28:37.859
60190057-a240-4429-b2a5-f770958d3865	Form 2	Second year of secondary education	bde2015e-8e30-4460-ad2b-c79837d9438b	2	t	2025-09-09 06:28:37.909
c03f9705-e64b-438d-af6e-4e4b0f2e8093	Form 3	Third year of secondary education	bde2015e-8e30-4460-ad2b-c79837d9438b	3	t	2025-09-09 06:28:37.954
9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	Form 4	Final year of secondary education	bde2015e-8e30-4460-ad2b-c79837d9438b	4	t	2025-09-09 06:28:37.998
fed98955-8ee2-4f34-8880-ebbfef53fc99	Year 9	First year of IGCSE preparation	3c091257-02e2-4f0c-9adf-4233db6c7f1f	1	t	2025-09-09 06:28:38.042
be8dd1d3-637d-412a-b92b-62d7a16bca3f	Year 10	Second year of IGCSE preparation	3c091257-02e2-4f0c-9adf-4233db6c7f1f	2	t	2025-09-09 06:28:38.086
22548bb2-08e0-4569-8830-13aa16fe7051	Year 11	IGCSE examination year	3c091257-02e2-4f0c-9adf-4233db6c7f1f	3	t	2025-09-09 06:28:38.131
bdc31e7b-582f-4555-9c29-2f29842e6082	Grade 1	First grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	1	t	2025-09-09 06:28:38.174
2f073f7b-a729-4323-8066-f785856eb5f7	Grade 2	Second grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	2	t	2025-09-09 06:28:38.219
3cfce747-a42a-4665-aeb2-c09068b2ba8b	Grade 3	Third grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	3	t	2025-09-09 06:28:38.263
cfe56c5d-f225-4364-8c8f-683e620bff94	Grade 4	Fourth grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	4	t	2025-09-09 06:28:38.305
800f5d94-0e11-430e-8d7c-f37f0ad97570	Grade 5	Fifth grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	5	t	2025-09-09 06:28:38.351
ea00b810-db3c-4e6c-9d95-a675256386a3	Grade 6	Sixth grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	6	t	2025-09-09 06:28:38.394
3775509e-6274-4bb7-a08a-50cf744df1ea	Grade 7	Seventh grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	7	t	2025-09-09 06:28:38.438
5b4c9281-b003-403c-b62e-e69598ef6cbd	Grade 8	Final grade of primary education	55d91204-9e44-4c9f-8497-fb61a4e4a661	8	t	2025-09-09 06:28:38.482
\.


--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_settings (id, email_notifications_enabled, daily_reminder_enabled, daily_reminder_time, streak_reminder_enabled, achievement_notifications_enabled, leaderboard_updates_enabled, weekly_progress_report_enabled, weekly_progress_report_day, challenge_notifications_enabled, spark_boost_notifications_enabled, maintenance_notifications_enabled, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.password_reset_tokens (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_transactions (id, user_id, type, amount, currency, status, description, plan_id, paystack_reference, paystack_transaction_id, subscription_id, metadata, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.profiles (id, user_id, examination_system_id, level_id, current_term, sparks, streak, current_streak, longest_streak, rank, last_quiz_date, last_activity, is_active, created_at, updated_at) FROM stdin;
7b73b64b-4510-4ad6-a954-1b4ecb2b7a9a	8eb5cca0-43c2-4fc3-a535-466027153128	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	0	0	0	0	\N	\N	2025-09-18 15:19:01.01829	t	2025-09-18 15:19:01.01829	2025-09-18 15:19:01.01829
demo-profile-1	demo-student-1	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	2850	45	0	0	1	\N	2025-08-09 08:40:51.457	t	2025-09-09 06:28:41.983	2025-09-09 06:28:41.983
demo-profile-2	demo-student-2	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	2720	38	0	0	2	\N	2025-08-09 08:40:51.457	t	2025-09-09 06:28:42.03	2025-09-09 06:28:42.03
demo-profile-3	demo-student-3	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	2650	42	0	0	3	\N	2025-08-09 08:40:51.457	t	2025-09-09 06:28:42.074	2025-09-09 06:28:42.074
demo-profile-4	demo-student-4	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	2480	35	0	0	4	\N	2025-08-09 08:40:51.457	t	2025-09-09 06:28:42.118	2025-09-09 06:28:42.118
demo-profile-5	demo-student-5	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	2390	29	0	0	5	\N	2025-08-09 08:40:51.457	t	2025-09-09 06:28:42.16	2025-09-09 06:28:42.16
demo-profile-6	demo-student-6	bde2015e-8e30-4460-ad2b-c79837d9438b	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	Term 1	2210	31	0	0	6	\N	2025-08-09 08:40:51.457	t	2025-09-09 06:28:42.208	2025-09-09 06:28:42.208
\.


--
-- Data for Name: question_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.question_types (id, title, description, code, created_at) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.questions (id, topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_at) FROM stdin;
906a1f63-48da-41ae-88a0-20436f5bfdbd	\N	What is the SI unit of force?	Newton	Joule	Watt	Pascal	A	The SI unit of force is the Newton, which is defined as the force required to accelerate a one-kilogram mass by one meter per second squared.	easy	2025-09-09 06:29:32.036
87445cb9-db0d-4bbf-89ce-0e6312872d00	\N	Which of the following is a vector quantity?	Mass	Speed	Velocity	Temperature	C	Velocity is a vector quantity because it has both magnitude and direction, unlike speed which only has magnitude.	easy	2025-09-09 06:29:32.087
5f683329-802e-4766-8ad3-4dc0cf6ccf7f	\N	What is the primary purpose of a fuse in an electrical circuit?	To increase the voltage	To reduce the resistance	To prevent excessive current flow	To increase the current	C	A fuse is used to protect an electrical circuit by breaking the circuit if the current exceeds a safe level, preventing overheating and potential fires.	easy	2025-09-09 06:29:32.135
2b1e9b40-ecde-4b6b-846c-34fb02cf0290	\N	Which of the following instruments is used to measure atmospheric pressure?	Thermometer	Barometer	Hygrometer	Anemometer	B	A barometer is an instrument used to measure atmospheric pressure, which is essential for weather forecasting and altitude measurement.	easy	2025-09-09 06:29:32.182
43783404-3eb3-48d9-b9d3-64e44ba6c218	\N	What type of image is formed by a plane mirror?	Real and inverted	Virtual and inverted	Real and upright	Virtual and upright	D	A plane mirror forms a virtual and upright image that is laterally inverted. Virtual images cannot be projected on a screen.	easy	2025-09-09 06:29:32.229
5ba2f696-a954-443e-bbb5-bc3ef359eb69	\N	Which of the following is a non-renewable energy source?	Solar energy	Wind energy	Coal	Geothermal energy	C	Coal is a non-renewable energy source because it is formed from fossilized organic matter and takes millions of years to form, unlike renewable sources like solar and wind.	easy	2025-09-09 06:29:32.277
628fa8ad-031a-4d1b-a887-a400ab3583fc	\N	Which principle explains why a ship floats on water?	Archimedes' Principle	Pascal's Principle	Bernoulli's Principle	Newton's First Law	A	Archimedes' Principle states that an object submerged in fluid experiences a buoyant force equal to the weight of the fluid displaced, allowing a ship to float.	easy	2025-09-09 06:29:32.325
3185bc0b-fef0-499d-ac70-6bdd33f5a4f2	\N	What is the main reason for using copper in electrical cables?	High density	High resistance	High conductivity	High cost	C	Copper is used in electrical cables primarily because of its high electrical conductivity, allowing efficient transmission of electricity.	easy	2025-09-09 06:29:32.372
042996e4-12eb-4bdd-ba7a-065cc1cd6701	\N	What does an ammeter measure?	Voltage	Current	Resistance	Temperature	B	An ammeter is an instrument used to measure the electric current in a circuit, typically in amperes.	easy	2025-09-09 06:29:32.422
3821bdcc-593c-466d-8aae-111949c5dfc8	\N	Which of the following is not a property of light?	Refraction	Diffusion	Diffraction	Reflection	B	Diffusion is not a property of light. It is the process of spreading something more widely, typically in gases or fluids. Light exhibits refraction, diffraction, and reflection.	easy	2025-09-09 06:29:32.477
d3a9c7cf-b026-4f41-b6ef-b7888075b5d0	\N	What is the effect of increasing the length of a pendulum on its period?	Period decreases	Period increases	Period remains the same	Period doubles	B	The period of a pendulum is directly proportional to the square root of its length. Increasing the length increases the period.	medium	2025-09-09 06:29:32.525
3c029c00-e59e-4835-9947-1b35cc0ce460	\N	Which law explains the relationship between current, voltage, and resistance?	Ohm's Law	Kirchhoff's Law	Coulomb's Law	Faraday's Law	A	Ohm's Law states that the current through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to the resistance.	medium	2025-09-09 06:29:32.571
6995041b-f8b7-4a48-8a5d-4a82c1db188c	\N	What is the acceleration due to gravity on the surface of the Earth?	9.8 m/s²	6.67 m/s²	10.8 m/s²	5.5 m/s²	A	The standard acceleration due to gravity on Earth's surface is approximately 9.8 meters per second squared.	medium	2025-09-09 06:29:32.619
604f00c4-7609-4939-91ba-4163a023c327	\N	What happens to the pressure of a gas if its volume is reduced while the temperature remains constant?	Pressure decreases	Pressure increases	Pressure remains the same	Pressure doubles	B	According to Boyle's Law, the pressure of a gas is inversely proportional to its volume when temperature is constant. Therefore, reducing the volume increases the pressure.	medium	2025-09-09 06:29:32.666
cd64933c-e41b-4909-a952-e369d9d3d6f0	\N	Which of the following is not a longitudinal wave?	Sound wave	Seismic P-wave	Water wave	Ultrasound wave	C	Water waves are not purely longitudinal; they are a combination of longitudinal and transverse motions. Longitudinal waves include sound and seismic P-waves.	medium	2025-09-09 06:29:32.714
c999f4ad-be4f-473f-91bc-8d637e238a90	\N	What is the primary function of a transformer?	To increase resistance	To convert DC to AC	To change voltage levels	To store electrical energy	C	A transformer is used to change the voltage levels of alternating current (AC) in power systems, either stepping up or stepping down the voltage.	medium	2025-09-09 06:29:32.76
6ca1daa8-5724-4392-8a31-8e875d72c2b9	\N	Which of the following best describes the term 'temperature'?	The amount of heat energy in a substance	The average kinetic energy of particles in a substance	The total energy of all particles in a substance	The potential energy of particles in a substance	B	Temperature is a measure of the average kinetic energy of the particles in a substance. It indicates how hot or cold the substance is.	medium	2025-09-09 06:29:32.808
71d2d447-a038-44e1-b80f-872e0a534005	\N	Which of the following materials is the best conductor of electricity?	Rubber	Glass	Copper	Plastic	C	Copper is a metal with high electrical conductivity, making it an excellent conductor of electricity, unlike insulators like rubber, glass, and plastic.	medium	2025-09-09 06:29:32.856
39b0aaae-238b-42c0-8b2f-832f9645548e	\N	What determines the pitch of a sound?	Amplitude	Frequency	Speed	Wavelength	B	The pitch of a sound is determined by its frequency. Higher frequency sounds have a higher pitch, while lower frequency sounds have a lower pitch.	medium	2025-09-09 06:29:32.904
e85d3dae-5c0f-4268-9075-b59848e1e98a	\N	Which of the following best describes inertia?	The ability of an object to resist changes in motion	The force exerted by a moving object	The speed of an object in free fall	The energy stored in an object	A	Inertia is the property of an object to resist changes in its state of motion. It is directly related to the mass of the object.	medium	2025-09-09 06:29:32.951
58496c6b-cee7-406c-b467-7b8df73603ff	\N	Which process describes the transfer of heat through a solid?	Convection	Radiation	Conduction	Evaporation	C	Conduction is the transfer of heat through a solid material where heat is passed from particle to particle through direct contact.	medium	2025-09-09 06:29:32.999
e2adcdd5-97b0-446c-9206-b6d10d96fe50	\N	What occurs to light as it passes through a prism?	It absorbs	It refracts	It reflects	It diffuses	B	Light refracts, or bends, as it passes through a prism, resulting in the dispersion of white light into its constituent colors, forming a spectrum.	medium	2025-09-09 06:29:33.047
ae847339-46f1-46fa-8064-53d796c466f2	\N	Which of the following is not an example of a mechanical wave?	Sound wave	Seismic wave	Light wave	Water wave	C	Light waves are electromagnetic waves, not mechanical. Mechanical waves require a medium to travel through, such as sound, seismic, and water waves.	medium	2025-09-09 06:29:33.095
ecf916d1-dcee-4d2d-bbf4-9daa4af61bf6	\N	What is the primary cause of tides on Earth?	The Earth's rotation	The gravitational pull of the Moon	The gravitational pull of the Sun	The wind patterns	B	Tides are primarily caused by the gravitational pull of the Moon on the Earth's oceans, with the Sun contributing to a lesser extent.	medium	2025-09-09 06:29:33.146
f3d0261a-aa3d-4f82-a648-0c1ad0906740	\N	What is the term for the change in frequency of a wave in relation to an observer moving relative to the source?	Doppler Effect	Refraction	Diffraction	Interference	A	The Doppler Effect refers to the change in frequency or wavelength of a wave in relation to an observer who is moving relative to the wave source.	medium	2025-09-09 06:29:33.193
a6841427-d847-4c45-8ed0-4725eee02db4	\N	How does the speed of sound in air compare to its speed in water?	Faster in air	Faster in water	Same speed	Depends on temperature	B	The speed of sound is faster in water than in air because water is denser, allowing sound waves to travel more efficiently between the molecules.	medium	2025-09-09 06:29:33.24
10c17084-8bf7-4163-b21a-219f583cc692	\N	Which of the following phenomena demonstrates that light can behave as a wave?	Photoelectric effect	Reflection	Interference	Refraction	C	Interference is a wave phenomenon where two or more light waves superpose to form a resultant wave, demonstrating the wave nature of light.	medium	2025-09-09 06:29:33.288
785a89bd-a975-4a5e-b31d-c49a5290ab61	\N	What type of mirror can be used to focus light to a single point?	Plane mirror	Convex mirror	Concave mirror	Spherical mirror	C	A concave mirror can focus parallel rays of light to a single point known as the focal point. This property is used in devices like telescopes.	medium	2025-09-09 06:29:33.335
15bcda72-e05f-470e-9831-cce9887e9afd	\N	Which of the following best describes the term 'work' in physics?	The energy transferred by a force over a distance	The power expended over time	The pressure applied over an area	The heat transferred between objects	A	In physics, work is defined as the energy transferred to or from an object via the application of force along a displacement.	medium	2025-09-09 06:29:33.383
cd287984-8a67-41de-8f15-15b2b6ba9fac	\N	What is the term for the bending of waves around obstacles and openings?	Reflection	Refraction	Diffraction	Interference	C	Diffraction is the bending of waves around the corners of an obstacle or through an aperture, which is a property of wave behavior.	medium	2025-09-09 06:29:33.432
766aed51-9e95-4c0f-a663-8d88ea8f81da	\N	Which of the following is a unit of force?	Newton	Pascal	Joule	Watt	A	The Newton is the unit of force in the International System of Units (SI). One Newton is the force required to accelerate one kilogram of mass at the rate of one meter per second squared.	easy	2025-09-09 06:29:33.479
02b6b3c7-be6f-4583-b13e-7bf5ac02d1e3	\N	What is the primary source of energy for the Earth?	The Sun	Wind	Geothermal energy	Nuclear energy	A	The Sun is the primary source of energy for Earth. It provides the energy necessary for climate and weather systems, and supports life through photosynthesis in plants.	easy	2025-09-09 06:29:33.544
910ee492-a876-4c67-9e3c-f9a756e4e7e6	\N	Which of the following instruments is used to measure mass?	Spring balance	Thermometer	Stopwatch	Beam balance	D	A beam balance is used to measure mass by comparing the mass of an object with known masses. It provides a direct measure of an object's mass.	easy	2025-09-09 06:29:33.596
d2d050a3-86aa-442f-a48a-04defd5405ea	\N	In which state of matter do particles have the most energy?	Solid	Liquid	Gas	Plasma	D	Plasma, often referred to as the fourth state of matter, consists of highly energized particles that have the ability to conduct electricity and respond to magnetic fields. It has more energy than solids, liquids, or gases.	medium	2025-09-09 06:29:33.644
0857c498-c9e3-4e85-b8e0-bbb691cb91be	\N	What is the term for the transfer of heat through direct contact?	Radiation	Convection	Conduction	Evaporation	C	Conduction is the process of heat transfer through direct contact of molecules within a substance. It occurs when heat is transferred from a hotter part to a cooler part through molecules colliding.	easy	2025-09-09 06:29:33.691
702a1f02-1a08-42a3-9e46-ab6c936ba9b3	\N	Which of the following physical quantities is a vector?	Mass	Temperature	Velocity	Energy	C	Velocity is a vector quantity because it has both magnitude and direction. In contrast, mass, temperature, and energy are scalar quantities with magnitude only.	medium	2025-09-09 06:29:33.739
d6f7c274-68e7-423c-b45a-5e908e742faa	\N	Which of the following is the best conductor of electricity?	Copper	Wood	Glass	Rubber	A	Copper is a metal and is well known for its excellent electrical conductivity, which makes it widely used in electrical wiring.	medium	2025-09-09 06:29:33.786
b2aafe79-2690-4f38-985e-da73bc18432b	\N	What is the acceleration due to gravity on Earth's surface?	9.8 m/s²	8.9 m/s²	10 m/s²	9.2 m/s²	A	The standard acceleration due to gravity on Earth's surface is approximately 9.8 m/s². This value is used in equations of motion and other calculations involving gravity.	easy	2025-09-09 06:29:33.834
feb0fdff-959a-4566-9cd0-72f3b422c853	\N	Which of the following is not a renewable source of energy?	Solar energy	Wind energy	Coal	Hydroelectric power	C	Coal is a fossil fuel and is not renewable because it takes millions of years to form. Solar, wind, and hydroelectric power are renewable as they are naturally replenished.	medium	2025-09-09 06:29:33.882
232a3dc5-4bdb-4a00-bea3-a4a27883debe	\N	Which property of a wave is measured in Hertz?	Frequency	Amplitude	Wavelength	Speed	A	Frequency is the number of cycles of a wave passing a point per unit time, measured in Hertz (Hz). One Hertz is equivalent to one cycle per second.	medium	2025-09-09 06:29:33.929
5b8c0bad-d42d-48ff-a1e1-feb62b2dd722	\N	What is the term for materials that do not allow heat to pass through them easily?	Conductors	Insulators	Metalloids	Semiconductors	B	Insulators are materials that do not allow heat to pass through them easily. They are used to prevent heat loss or gain, such as in thermal insulation.	easy	2025-09-09 06:29:33.978
ff097d62-7db2-4f05-a6ac-a6a155c565e4	\N	Which law explains why a boat moves forward when a person pushes water backward with a paddle?	Newton's First Law	Newton's Second Law	Newton's Third Law	Law of Conservation of Energy	C	Newton's Third Law states that for every action, there is an equal and opposite reaction. When the person pushes the water backward, the water pushes the boat forward with an equal force.	medium	2025-09-09 06:29:34.025
fe926186-f7bf-40fc-973e-41393f692729	\N	Which of the following is the correct formula for calculating density?	Density = Mass × Volume	Density = Volume / Mass	Density = Mass / Volume	Density = Mass + Volume	C	Density is defined as mass per unit volume, and the formula is Density = Mass / Volume. It measures how much mass is contained in a given volume.	easy	2025-09-09 06:29:34.071
d56cc978-12ad-44a8-bcbf-57f7027f85dd	\N	What is the term for the bending of light as it passes from one medium to another?	Reflection	Refraction	Diffraction	Interference	B	Refraction is the bending of light as it passes from one medium to another with a different density. This change in speed causes the light to change direction.	medium	2025-09-09 06:29:34.119
18e83416-148b-4334-a0ee-d1e445e5adae	\N	Which of the following is an example of a non-contact force?	Friction	Tension	Magnetic force	Normal force	C	Magnetic force is a non-contact force because it acts at a distance without direct physical contact. It can attract or repel magnetic materials.	medium	2025-09-09 06:29:34.167
1ac04e8d-86ab-4b02-8c67-a979c8e2c821	\N	Which of the following states that energy cannot be created or destroyed, only transformed?	Conservation of Mass	Conservation of Energy	Conservation of Momentum	Conservation of Charge	B	The Law of Conservation of Energy states that energy cannot be created or destroyed, only transformed from one form to another. The total energy in a closed system remains constant.	medium	2025-09-09 06:29:34.215
a2a32308-b8eb-4af7-ac53-b128fbced57e	\N	Which of these devices converts electrical energy into mechanical energy?	Electric generator	Electric motor	Transformer	Battery	B	An electric motor converts electrical energy into mechanical energy, allowing it to do work, such as turning the blades of a fan.	medium	2025-09-09 06:29:34.262
0bc3876f-6bf2-4d8d-bf34-f9cf16820222	\N	Which of the following is the correct unit for measuring power?	Joule	Newton	Watt	Pascal	C	Power is measured in Watts, which is equivalent to one Joule per second. It quantifies the rate at which work is done or energy is transferred.	easy	2025-09-09 06:29:34.313
45b8ed1a-6257-4e58-abbe-a9f2ba7bd125	\N	Which phenomenon explains the increase in volume of a gas when its temperature is increased at constant pressure?	Boyle's Law	Charles's Law	Pascal's Principle	Bernoulli's Principle	B	Charles's Law states that the volume of a gas is directly proportional to its temperature at constant pressure. As temperature increases, so does volume.	medium	2025-09-09 06:29:34.359
77829d6a-d2ea-42ec-85a6-83da1a779396	\N	What is the term for the force that opposes the relative motion of two surfaces in contact?	Tension	Normal force	Friction	Centripetal force	C	Friction is the force that opposes the relative motion or tendency of such motion of two surfaces in contact. It acts parallel to the surfaces.	easy	2025-09-09 06:29:34.407
2b6d63ba-7fb5-4442-b276-52aa19855360	\N	Which of the following elements is used in thermometers because it expands uniformly?	Water	Mercury	Alcohol	Oil	B	Mercury is used in thermometers because it expands uniformly with temperature changes, allowing for accurate measurements.	medium	2025-09-09 06:29:34.454
a8187ccc-ef7f-4d4e-b073-f79fc62c0307	\N	What is the term for a material's resistance to flow?	Density	Viscosity	Elasticity	Conductivity	B	Viscosity is a measure of a fluid's resistance to flow. Higher viscosity means the fluid flows more slowly, like honey compared to water.	medium	2025-09-09 06:29:34.501
3696c833-ed4b-4769-9f5d-2fee43e7e6c3	\N	Which of these particles is negatively charged?	Proton	Electron	Neutron	Photon	B	Electrons are negatively charged particles that orbit the nucleus of an atom. Protons are positively charged, while neutrons have no charge.	easy	2025-09-09 06:29:34.55
de685840-5c42-454c-9269-8e35178db100	\N	What is the name of the point where the entire weight of an object appears to act?	Centre of gravity	Centre of mass	Equilibrium point	Centre of motion	A	The centre of gravity is the point where the entire weight of an object appears to act, and it is the balance point of the object.	medium	2025-09-09 06:29:34.598
1f9938df-2e86-498a-af59-94bfcefc0522	\N	Which of the following is a scalar quantity?	Displacement	Force	Speed	Velocity	C	Speed is a scalar quantity because it only has magnitude and no direction, unlike velocity which is a vector quantity.	medium	2025-09-09 06:29:34.645
98cec6b0-ff89-44f8-9e4a-687822546139	\N	What is the name of the process by which a liquid changes into a gas at its surface?	Boiling	Condensation	Evaporation	Sublimation	C	Evaporation is the process by which molecules at the surface of a liquid gain enough energy to become a gas. It occurs at temperatures below boiling point.	easy	2025-09-09 06:29:34.694
f21ca8a7-7ac2-4744-9f16-537f27dce602	\N	Which of the following is not a form of electromagnetic radiation?	Sound waves	X-rays	Microwaves	Infrared	A	Sound waves are mechanical waves, not electromagnetic waves. Electromagnetic radiation includes X-rays, microwaves, and infrared.	medium	2025-09-09 06:29:34.741
0cb5e449-4d8c-43df-9fc1-4536c5ce4f53	\N	Which force keeps the planets in orbit around the Sun?	Magnetic force	Electrostatic force	Gravitational force	Nuclear force	C	Gravitational force is the force of attraction between two masses. It is the force that keeps the planets in orbit around the Sun.	easy	2025-09-09 06:29:34.789
575a2033-8d12-47ae-9da8-c9ad6f83ff7f	\N	What is the name of the device that measures atmospheric pressure?	Thermometer	Barometer	Ammeter	Voltmeter	B	A barometer is an instrument used to measure atmospheric pressure. It is commonly used in weather forecasting.	easy	2025-09-09 06:29:34.837
ea60932b-1cfd-42c2-b066-9f6f3e02f03d	\N	What is the term for the force exerted by a fluid on an object moving through it?	Drag	Lift	Thrust	Buoyancy	A	Drag is the force exerted by a fluid (such as air or water) that opposes an object's motion through the fluid. It is a form of friction.	medium	2025-09-09 06:29:34.888
54746047-aceb-4db3-9449-0861447025dc	\N	Which of the following describes the tendency of an object to resist changes in its state of motion?	Inertia	Momentum	Force	Velocity	A	Inertia is the property of matter that causes it to resist changes in its state of motion. It depends on the mass of the object.	easy	2025-09-09 06:29:34.937
8a415d96-7b37-485f-80e4-4be0ed0cb198	\N	Which of the following is an example of a scalar quantity?	Velocity	Force	Speed	Displacement	C	Speed is a scalar quantity because it only has magnitude and no direction, unlike velocity, force, and displacement which are vectors.	easy	2025-09-09 06:29:34.985
4e9d747f-cfae-4745-ba16-03b0df84377a	\N	What is the SI unit of force?	Joule	Pascal	Newton	Watt	C	The SI unit of force is the Newton (N), named after Sir Isaac Newton in recognition of his work on classical mechanics.	easy	2025-09-09 06:29:35.031
34914c9d-599f-41f2-b3d4-5e2320f3bf60	\N	Which of the following instruments is used to measure atmospheric pressure?	Thermometer	Barometer	Hygrometer	Anemometer	B	A barometer is used to measure atmospheric pressure. It can be used in weather forecasting to predict short-term changes in the weather.	easy	2025-09-09 06:29:35.079
2dfd2442-7452-46be-9e08-91944a7f8678	\N	What is the primary purpose of a fuse in an electrical circuit?	To increase current flow	To decrease voltage	To protect against overcurrent	To conduct electricity	C	A fuse is a safety device used to protect an electrical circuit by breaking the connection if the current exceeds a safe level, thereby preventing overcurrent.	easy	2025-09-09 06:29:35.129
4f038f36-2a46-4b6b-8921-05b0c89457b9	\N	Which one of the following is a renewable source of energy?	Coal	Natural gas	Solar energy	Nuclear energy	C	Solar energy is renewable because it is derived from the sun, which is a consistent and ongoing source of power.	easy	2025-09-09 06:29:35.178
f9f5b373-1038-4bff-9cfa-a7d14a6a87e3	\N	What is the effect of increasing the temperature of a gas at constant volume?	The gas pressure decreases	The gas pressure remains constant	The gas pressure increases	The gas expands	C	According to Gay-Lussac's law, the pressure of a gas increases with an increase in temperature if the volume remains constant.	medium	2025-09-09 06:29:35.224
7211fc0e-a54f-409b-b606-ff47f9199683	\N	Which material is a good conductor of electricity?	Rubber	Glass	Copper	Wood	C	Copper is a good conductor of electricity due to its high electrical conductivity, making it commonly used in electrical wiring.	easy	2025-09-09 06:29:35.272
804fe0c3-a312-40b2-ba6a-bd3b7b7f24a6	\N	In which of the following media does sound travel the fastest?	Air	Water	Iron	Vacuum	C	Sound travels fastest in solids like iron because the particles are closely packed, allowing sound waves to transmit more efficiently.	medium	2025-09-09 06:29:35.32
2926bdf3-e207-4130-bd34-50bb9371c120	\N	Which law describes the relationship between the pressure and volume of a gas at constant temperature?	Boyle's Law	Charles's Law	Pascal's Law	Newton's Law	A	Boyle's Law states that the pressure of a gas is inversely proportional to its volume at constant temperature.	medium	2025-09-09 06:29:35.367
435d4fb7-7cc7-43c7-99e4-1627ac26c669	\N	What is the acceleration due to gravity on Earth?	9.8 m/s	9.8 m/s²	10.8 m/s²	9.8 km/s	B	The acceleration due to gravity on Earth is approximately 9.8 m/s², which is the rate at which objects accelerate towards the Earth when in free fall.	easy	2025-09-09 06:29:35.415
7df6c608-e485-46eb-b55d-94fd17f0e7f1	\N	What is the term for the bending of light as it passes from one medium to another?	Reflection	Diffraction	Refraction	Dispersion	C	Refraction is the bending of light as it passes from one medium to another due to a change in its speed.	medium	2025-09-09 06:29:35.463
e1c3d908-c6b1-46fd-adbf-c53fd0e97df5	\N	Which of the following is a characteristic of a wave?	Mass	Volume	Amplitude	Density	C	Amplitude is a characteristic of a wave that measures the maximum displacement of points on the wave from its rest position.	medium	2025-09-09 06:29:35.51
5e2fbb4f-bdc3-4ec0-b6bc-f03300da92d7	\N	What type of image is formed by a plane mirror?	Real and inverted	Virtual and erect	Real and magnified	Virtual and inverted	B	A plane mirror forms a virtual and erect image that is the same size as the object.	easy	2025-09-09 06:29:35.558
fec2c389-4e1b-4f5d-9442-7e3e78b4578c	\N	What is the principle behind the operation of a hydraulic press?	Archimedes' Principle	Pascal's Principle	Bernoulli's Principle	Newton's Third Law	B	Pascal's Principle states that a change in pressure applied to a confined fluid is transmitted undiminished throughout the fluid, which is the principle behind hydraulic systems.	medium	2025-09-09 06:29:35.606
2e9a4b8a-2589-45ee-983d-a49e636404a4	\N	What is the unit of electric current?	Volt	Ampere	Ohm	Watt	B	The unit of electric current is the Ampere (A), which measures the flow of electric charge.	easy	2025-09-09 06:29:35.655
61f77264-b66f-48a9-9312-fc6d74a1b385	\N	Which of the following substances would float on water?	Iron	Aluminium	Ice	Copper	C	Ice floats on water because it is less dense than liquid water, due to the molecular structure of ice.	easy	2025-09-09 06:29:35.703
4333ad89-add8-43ac-be16-ff1e43e1217d	\N	Which of the following devices converts chemical energy into electrical energy?	Transformer	Battery	Generator	Motor	B	A battery converts chemical energy into electrical energy through electrochemical reactions within its cells.	medium	2025-09-09 06:29:35.75
44014381-64b9-4fd7-9e51-32af5ff550e8	\N	What is the speed of light in a vacuum?	3 x 10^6 m/s	3 x 10^8 m/s	3 x 10^9 m/s	3 x 10^7 m/s	B	The speed of light in a vacuum is approximately 3 x 10^8 meters per second, which is a fundamental constant of nature.	medium	2025-09-09 06:29:35.798
947cbbfa-aebe-4336-9f73-4f5ba8b5dd1d	\N	What is the main factor that affects the pitch of a sound?	Amplitude	Frequency	Wavelength	Velocity	B	The pitch of a sound is determined by its frequency; higher frequencies correspond to higher pitches.	medium	2025-09-09 06:29:35.845
860ea11b-1098-4f73-9f75-b3b4e0c1c74c	\N	Which of the following is not a thermometric property?	Volume of a gas	Resistance of a wire	Pressure of a gas	Mass of a liquid	D	Mass of a liquid is not a thermometric property; thermometric properties change with temperature and can be used to measure it, like volume, resistance, and pressure.	medium	2025-09-09 06:29:35.893
4008b23f-329a-4ae5-9837-89fbfcf495c7	\N	Which type of lens is used to correct short-sightedness (myopia)?	Convex lens	Concave lens	Bifocal lens	Cylindrical lens	B	A concave lens is used to correct short-sightedness by diverging light rays before they reach the eye, enabling a proper focus on the retina.	medium	2025-09-09 06:29:35.939
ed21c922-da22-491b-82ae-3604dbc942e6	\N	Which of the following is a property of all electromagnetic waves?	They require a medium to travel	They travel at the same speed in a vacuum	They are longitudinal waves	They have the same frequency	B	All electromagnetic waves travel at the same speed in a vacuum, which is the speed of light, approximately 3 x 10^8 m/s.	medium	2025-09-09 06:29:35.986
3457d795-eb85-4a1c-b14e-f68e60f732d2	\N	What happens to the current in a series circuit if one of the components fails?	The current increases	The current decreases	The current stops	The current remains the same	C	In a series circuit, if one component fails, the entire circuit is broken, and the current stops flowing.	easy	2025-09-09 06:29:36.034
2236a154-9849-4b38-933a-f228e3326b12	\N	Which of the following is not an effect of electric current?	Magnetic effect	Chemical effect	Thermal effect	Optical effect	D	Electric current can produce magnetic, chemical, and thermal effects, but not optical effects directly.	medium	2025-09-09 06:29:36.081
7e8a7e13-592d-4928-bae9-57455426d3fe	\N	Which of the following phenomena demonstrates the wave nature of light?	Photoelectric effect	Interference	Emission spectra	Reflection	B	Interference is a phenomenon that demonstrates the wave nature of light, as it involves the superposition of light waves leading to regions of constructive and destructive interference.	medium	2025-09-09 06:29:36.129
0c2baa47-4f15-4056-b824-d4dd221c33d9	\N	What is the name of the force that opposes the relative motion of two surfaces in contact?	Gravitational force	Normal force	Frictional force	Tension force	C	Frictional force is the force that opposes the relative motion or tendency of such motion of two surfaces in contact.	easy	2025-09-09 06:29:36.177
110ad20a-0391-4b96-96ae-e5ffe23327cc	\N	Which component is used to store electrical energy in a circuit?	Resistor	Capacitor	Inductor	Diode	B	A capacitor is an electrical component used to store energy electrostatically in an electric field.	medium	2025-09-09 06:29:36.225
9830b148-3a59-4ccd-ac3b-2a9748fd5854	\N	What is the function of a transformer in an electrical circuit?	To generate electricity	To convert AC to DC	To change the voltage	To store energy	C	A transformer is used in electrical circuits to change the voltage level, either increasing (step-up) or decreasing (step-down) the voltage.	medium	2025-09-09 06:29:36.272
25508c5c-e2bb-4169-89aa-d3f480f7b6ca	\N	Which of the following is the best conductor of electricity?	Silver	Gold	Copper	Aluminum	A	Silver is the best conductor of electricity due to its highest electrical conductivity among all metals, though copper is more commonly used due to cost considerations.	medium	2025-09-09 06:29:36.32
570530d4-fcf7-42fd-8ece-7a260334a2b4	\N	What is the term for the resistance to motion when an object is moving through a fluid?	Friction	Drag	Tension	Upthrust	B	Drag is the resistance force caused by the motion of an object through a fluid, such as air or water.	medium	2025-09-09 06:29:36.372
\.


--
-- Data for Name: quiz_question_answers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quiz_question_answers (id, quiz_session_id, quiz_question_id, quiz_question_choice_id, answer, is_correct, marks, sparks, time_spent, answered_at) FROM stdin;
\.


--
-- Data for Name: quiz_question_choices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quiz_question_choices (id, quiz_question_id, content, is_correct, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quiz_questions (id, quiz_id, content, question_type_id, marks, difficulty, explanation, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: quiz_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quiz_sessions (id, user_id, profile_id, subject_id, quiz_type, topic_id, term_id, quiz_questions, total_questions, current_question_index, correct_answers, sparks_earned, time_spent, completed, started_at, completed_at) FROM stdin;
quiz-demo-1	demo-student-1	demo-profile-1	eb371e93-ddef-421e-9ff9-05b36a454e12	random	\N	\N	[{"id": "906a1f63-48da-41ae-88a0-20436f5bfdbd", "option_a": "Newton", "option_b": "Joule", "option_c": "Watt", "option_d": "Pascal", "difficulty": "easy", "explanation": "The SI unit of force is the Newton, which is defined as the force required to accelerate a one-kilogram mass by one meter per second squared.", "question_text": "What is the SI unit of force?", "correct_answer": "A"}, {"id": "87445cb9-db0d-4bbf-89ce-0e6312872d00", "option_a": "Mass", "option_b": "Speed", "option_c": "Velocity", "option_d": "Temperature", "difficulty": "easy", "explanation": "Velocity is a vector quantity because it has both magnitude and direction, unlike speed which only has magnitude.", "question_text": "Which of the following is a vector quantity?", "correct_answer": "C"}, {"id": "5f683329-802e-4766-8ad3-4dc0cf6ccf7f", "option_a": "To increase the voltage", "option_b": "To reduce the resistance", "option_c": "To prevent excessive current flow", "option_d": "To increase the current", "difficulty": "easy", "explanation": "A fuse is used to protect an electrical circuit by breaking the circuit if the current exceeds a safe level, preventing overheating and potential fires.", "question_text": "What is the primary purpose of a fuse in an electrical circuit?", "correct_answer": "C"}]	3	3	3	45	300000	t	2025-09-20 10:00:00	2025-09-20 10:05:00
quiz-demo-2	demo-student-2	demo-profile-2	eb371e93-ddef-421e-9ff9-05b36a454e12	topical	\N	\N	[{"id": "906a1f63-48da-41ae-88a0-20436f5bfdbd", "option_a": "Newton", "option_b": "Joule", "option_c": "Watt", "option_d": "Pascal", "difficulty": "easy", "explanation": "The SI unit of force is the Newton, which is defined as the force required to accelerate a one-kilogram mass by one meter per second squared.", "question_text": "What is the SI unit of force?", "correct_answer": "A"}, {"id": "87445cb9-db0d-4bbf-89ce-0e6312872d00", "option_a": "Mass", "option_b": "Speed", "option_c": "Velocity", "option_d": "Temperature", "difficulty": "easy", "explanation": "Velocity is a vector quantity because it has both magnitude and direction, unlike speed which only has magnitude.", "question_text": "Which of the following is a vector quantity?", "correct_answer": "C"}]	2	2	2	30	240000	t	2025-09-21 14:00:00	2025-09-21 14:04:00
quiz-demo-3	demo-student-3	demo-profile-3	eb371e93-ddef-421e-9ff9-05b36a454e12	random	\N	\N	[{"id": "906a1f63-48da-41ae-88a0-20436f5bfdbd", "option_a": "Newton", "option_b": "Joule", "option_c": "Watt", "option_d": "Pascal", "difficulty": "easy", "explanation": "The SI unit of force is the Newton, which is defined as the force required to accelerate a one-kilogram mass by one meter per second squared.", "question_text": "What is the SI unit of force?", "correct_answer": "A"}, {"id": "87445cb9-db0d-4bbf-89ce-0e6312872d00", "option_a": "Mass", "option_b": "Speed", "option_c": "Velocity", "option_d": "Temperature", "difficulty": "easy", "explanation": "Velocity is a vector quantity because it has both magnitude and direction, unlike speed which only has magnitude.", "question_text": "Which of the following is a vector quantity?", "correct_answer": "C"}, {"id": "5f683329-802e-4766-8ad3-4dc0cf6ccf7f", "option_a": "To increase the voltage", "option_b": "To reduce the resistance", "option_c": "To prevent excessive current flow", "option_d": "To increase the current", "difficulty": "easy", "explanation": "A fuse is used to protect an electrical circuit by breaking the circuit if the current exceeds a safe level, preventing overheating and potential fires.", "question_text": "What is the primary purpose of a fuse in an electrical circuit?", "correct_answer": "C"}, {"id": "2b1e9b40-ecde-4b6b-846c-34fb02cf0290", "option_a": "Thermometer", "option_b": "Barometer", "option_c": "Hygrometer", "option_d": "Anemometer", "difficulty": "easy", "explanation": "A barometer is an instrument used to measure atmospheric pressure, which is essential for weather forecasting and altitude measurement.", "question_text": "Which of the following instruments is used to measure atmospheric pressure?", "correct_answer": "B"}]	4	4	3	38	420000	t	2025-09-22 09:30:00	2025-09-22 09:37:00
quiz-demo-4-partial	demo-student-4	demo-profile-4	eb371e93-ddef-421e-9ff9-05b36a454e12	random	\N	\N	[{"id": "906a1f63-48da-41ae-88a0-20436f5bfdbd", "option_a": "Newton", "option_b": "Joule", "option_c": "Watt", "option_d": "Pascal", "difficulty": "easy", "explanation": "The SI unit of force is the Newton, which is defined as the force required to accelerate a one-kilogram mass by one meter per second squared.", "question_text": "What is the SI unit of force?", "correct_answer": "A"}, {"id": "87445cb9-db0d-4bbf-89ce-0e6312872d00", "option_a": "Mass", "option_b": "Speed", "option_c": "Velocity", "option_d": "Temperature", "difficulty": "easy", "explanation": "Velocity is a vector quantity because it has both magnitude and direction, unlike speed which only has magnitude.", "question_text": "Which of the following is a vector quantity?", "correct_answer": "C"}, {"id": "5f683329-802e-4766-8ad3-4dc0cf6ccf7f", "option_a": "To increase the voltage", "option_b": "To reduce the resistance", "option_c": "To prevent excessive current flow", "option_d": "To increase the current", "difficulty": "easy", "explanation": "A fuse is used to protect an electrical circuit by breaking the circuit if the current exceeds a safe level, preventing overheating and potential fires.", "question_text": "What is the primary purpose of a fuse in an electrical circuit?", "correct_answer": "C"}]	3	2	2	0	180000	f	2025-09-23 16:15:00	\N
\.


--
-- Data for Name: quiz_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quiz_settings (id, sparks_per_correct_answer, accuracy_bonus_threshold, accuracy_bonus_multiplier, good_accuracy_threshold, good_accuracy_multiplier, max_questions_per_quiz, min_questions_per_quiz, time_per_question_seconds, allow_skip_questions, show_correct_answers, show_explanations, randomize_questions, randomize_options, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: quiz_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quiz_types (id, title, description, code, created_at) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quizzes (id, title, description, examination_system_id, level_id, subject_id, quiz_type, topic_id, term_id, questions, total_questions, time_limit, difficulty, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
5-Jk5oEJmibgYoASk4-8G4iNEi4Q5GcU	{"user": {"id": "8eb5cca0-43c2-4fc3-a535-466027153128", "email": "josiahkamau180@gmail.com", "lastName": "j", "firstName": "j"}, "cookie": {"path": "/", "secure": false, "expires": "2025-09-25T15:18:33.742Z", "httpOnly": true, "originalMaxAge": 604800000}, "adminId": "6c77ade6-8784-4a33-a73c-11fb58d066ac", "isAdminAuthenticated": true}	2025-09-25 15:18:34
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subjects (id, name, code, examination_system_id, icon, color, created_at) FROM stdin;
547ffc3a-b94d-4010-b5fd-b65773c12328	Mathematics	MATH	bde2015e-8e30-4460-ad2b-c79837d9438b	calculator	#3B82F6	2025-09-09 06:28:38.526
75496eef-13e3-4071-8d37-6d6527ed07a5	English	ENG	bde2015e-8e30-4460-ad2b-c79837d9438b	book	#10B981	2025-09-09 06:28:38.581
fa73a32a-7027-4fbe-bcda-7c0431763b22	Kiswahili	KISW	bde2015e-8e30-4460-ad2b-c79837d9438b	globe	#F59E0B	2025-09-09 06:28:38.625
e391687a-3d73-447f-8942-28b4d9f0f33c	Biology	BIO	bde2015e-8e30-4460-ad2b-c79837d9438b	leaf	#059669	2025-09-09 06:28:38.668
eb371e93-ddef-421e-9ff9-05b36a454e12	Physics	PHY	bde2015e-8e30-4460-ad2b-c79837d9438b	atom	#7C3AED	2025-09-09 06:28:38.713
18c89482-24b4-400f-af4f-f9616ae884c2	Chemistry	CHEM	bde2015e-8e30-4460-ad2b-c79837d9438b	flask	#DC2626	2025-09-09 06:28:38.755
2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	History & Government	HIST	bde2015e-8e30-4460-ad2b-c79837d9438b	scroll	#8B5CF6	2025-09-09 06:28:38.799
e564e57b-97c1-47e2-8bf5-70c957ba2e4d	Geography	GEO	bde2015e-8e30-4460-ad2b-c79837d9438b	map	#06B6D4	2025-09-09 06:28:38.843
c0ead570-cd77-4b08-be0e-608ac87fe7c7	Business Studies	BST	bde2015e-8e30-4460-ad2b-c79837d9438b	briefcase	#F59E0B	2025-09-09 06:28:38.888
4f203b72-a622-40f0-8d13-b7cf5ef6c284	Agriculture	AGRI	bde2015e-8e30-4460-ad2b-c79837d9438b	sprout	#22C55E	2025-09-09 06:28:38.932
0b2d3407-3fc3-49e6-b652-1e6917e2ead2	Computer Studies	COMP	bde2015e-8e30-4460-ad2b-c79837d9438b	monitor	#3B82F6	2025-09-09 06:28:38.974
2f0c1d75-3acb-481f-a9a4-5b6700cfc2cc	Art & Design	ART	bde2015e-8e30-4460-ad2b-c79837d9438b	palette	#EC4899	2025-09-09 06:28:39.02
1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	Home Science	HOME	bde2015e-8e30-4460-ad2b-c79837d9438b	home	#F97316	2025-09-09 06:28:39.064
78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	Music	MUS	bde2015e-8e30-4460-ad2b-c79837d9438b	music	#A855F7	2025-09-09 06:28:39.109
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscription_plans (id, name, code, description, price, currency, billing_cycle, daily_quiz_limit, question_bank_size, features, has_ai_personalization, support_level, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: terms; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.terms (id, examination_system_id, title, description, "order", created_at) FROM stdin;
3417984d-8cce-44ec-a8b2-19fffffbb873	bde2015e-8e30-4460-ad2b-c79837d9438b	Term 1	First academic term covering foundational topics	1	2025-09-09 06:28:39.863
4c42f549-5abd-431d-86fc-c2db6f83d43b	bde2015e-8e30-4460-ad2b-c79837d9438b	Term 2	Second academic term with intermediate topics	2	2025-09-09 06:28:39.912
bdaca442-6f9d-4ddb-9d92-7ae933ccc637	bde2015e-8e30-4460-ad2b-c79837d9438b	Term 3	Third academic term with advanced and review topics	3	2025-09-09 06:28:39.955
50a37a85-6e83-4c96-9f7c-bc411c756581	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Michaelmas Term	First term of the academic year (September - December)	1	2025-09-09 06:28:39.999
0f610102-d8e0-4532-a616-dd83f27b22a6	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Lent Term	Second term of the academic year (January - March)	2	2025-09-09 06:28:40.043
bbfdd225-a974-49cd-b5e3-0586ec01e6d9	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Easter Term	Third term of the academic year (April - July)	3	2025-09-09 06:28:40.089
cdd15bdc-433e-4971-94c9-59a877ee908b	55d91204-9e44-4c9f-8497-fb61a4e4a661	Term 1	First term of the primary school year (January - April)	1	2025-09-09 06:28:40.133
2a112be9-af9f-4706-a972-c04f0e2f9217	55d91204-9e44-4c9f-8497-fb61a4e4a661	Term 2	Second term of the primary school year (May - August)	2	2025-09-09 06:28:40.187
eb2982e5-5a7b-44d6-93c8-ef9c28b74f78	55d91204-9e44-4c9f-8497-fb61a4e4a661	Term 3	Third term of the primary school year (September - December)	3	2025-09-09 06:28:40.23
05408d45-33aa-421e-96b6-3ebfb59505b7	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 1 Term 1	First term for Form 1 students (January - April)	11	2025-09-09 06:28:40.274
60f822aa-54ac-4066-9b99-79f38a8345d6	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 1 Term 2	Second term for Form 1 students (May - August)	12	2025-09-09 06:28:40.317
99f82484-1bee-4fae-b2a1-cd33c223874f	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 1 Term 3	Third term for Form 1 students (September - December)	13	2025-09-09 06:28:40.361
425c888f-db9f-436d-8982-808647749dce	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 2 Term 1	First term for Form 2 students (January - April)	21	2025-09-09 06:28:40.404
52b4a255-8747-4e3a-a4e9-392b63cca41b	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 2 Term 2	Second term for Form 2 students (May - August)	22	2025-09-09 06:28:40.451
c790f336-21ed-491f-ae27-218477d622c1	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 2 Term 3	Third term for Form 2 students (September - December)	23	2025-09-09 06:28:40.495
7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 3 Term 1	First term for Form 3 students (January - April)	31	2025-09-09 06:28:40.538
c79e5e7a-1226-4ee8-97d4-c4601380e64c	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 3 Term 2	Second term for Form 3 students (May - August)	32	2025-09-09 06:28:40.582
e068a27b-c6c3-4662-9445-e4c8abd691d6	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 3 Term 3	Third term for Form 3 students (September - December)	33	2025-09-09 06:28:40.625
66e1c25d-5290-4979-b0f9-c505ce1e8859	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 4 Term 1	First term for Form 4 students (January - April)	41	2025-09-09 06:28:40.669
8c7661b2-05ab-4eb4-9507-205243c23618	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 4 Term 2	Second term for Form 4 students (May - August)	42	2025-09-09 06:28:40.712
0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	bde2015e-8e30-4460-ad2b-c79837d9438b	Form 4 Term 3	Third term for Form 4 students (September - December)	43	2025-09-09 06:28:40.756
6aab3716-68c4-44c2-8a4a-500e80658de9	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 9 Michaelmas	Year 9 first term (September - December)	91	2025-09-09 06:28:40.799
8396ffc3-0179-4baa-9a37-eb943778d681	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 9 Lent	Year 9 second term (January - March)	92	2025-09-09 06:28:40.843
ab8d34ca-a460-4e30-a2dc-732701cf23b6	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 9 Easter	Year 9 third term (April - July)	93	2025-09-09 06:28:40.886
2c407576-140f-4d1b-8411-e3d1836262db	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 10 Michaelmas	Year 10 first term (September - December)	101	2025-09-09 06:28:40.93
3143c61f-98de-4d1e-99ee-e07a2ee07a36	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 10 Lent	Year 10 second term (January - March)	102	2025-09-09 06:28:40.973
ff5f8969-aaca-4179-878c-2c74f863ca1a	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 10 Easter	Year 10 third term (April - July)	103	2025-09-09 06:28:41.017
4eedb60e-0dd6-4e21-ab6a-2b9182e22035	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 11 Michaelmas	Year 11 first term (September - December)	111	2025-09-09 06:28:41.061
d17ccaa8-6b6c-49b0-9c92-479c0c6be3bc	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 11 Lent	Year 11 second term (January - March)	112	2025-09-09 06:28:41.104
fab31cf0-5152-4dc3-bae6-30e2e4abb173	3c091257-02e2-4f0c-9adf-4233db6c7f1f	Year 11 Easter	Year 11 third term (April - July)	113	2025-09-09 06:28:41.148
6b67a5c5-4ead-45b9-953f-28336aa3fc6b	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 1 Term 1	Grade 1 first term (January - April)	11	2025-09-09 06:28:41.191
14f663a7-dac6-4ee2-9f5f-4ad8490473af	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 1 Term 2	Grade 1 second term (May - August)	12	2025-09-09 06:28:41.235
eb60f2c1-e059-4e7c-bc95-7ecb5614e9af	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 1 Term 3	Grade 1 third term (September - December)	13	2025-09-09 06:28:41.279
879433d8-1b96-4f01-b9c7-f8f9e6a3fdc4	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 2 Term 1	Grade 2 first term (January - April)	21	2025-09-09 06:28:41.322
23af410e-b298-4845-8338-9caa48f59103	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 2 Term 2	Grade 2 second term (May - August)	22	2025-09-09 06:28:41.366
ebe2a5e6-05f2-443c-b2d8-a8e16a0f3a32	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 2 Term 3	Grade 2 third term (September - December)	23	2025-09-09 06:28:41.409
51cabbf4-8f13-4f54-82b7-79e85ae3b429	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 3 Term 1	Grade 3 first term (January - April)	31	2025-09-09 06:28:41.453
19b200af-0e96-4b45-b04f-1a2764fc9fcc	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 3 Term 2	Grade 3 second term (May - August)	32	2025-09-09 06:28:41.497
7983edd9-d34b-43b4-bff5-de9952e177f2	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 3 Term 3	Grade 3 third term (September - December)	33	2025-09-09 06:28:41.542
3641f531-acaf-420f-a2a2-1aebb537877e	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 4 Term 1	Grade 4 first term (January - April)	41	2025-09-09 06:28:41.586
e400af3b-fea2-45d2-a65b-aa7b65a6cac6	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 4 Term 2	Grade 4 second term (May - August)	42	2025-09-09 06:28:41.629
c305762b-98f8-4789-bae9-59dd0f8f131d	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 4 Term 3	Grade 4 third term (September - December)	43	2025-09-09 06:28:41.672
6eeb112a-0d12-4d1b-9fe7-8675e113fd62	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 5 Term 1	Grade 5 first term (January - April)	51	2025-09-09 06:28:41.716
1eea785f-2ce5-43d3-845f-8619f30163a0	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 5 Term 2	Grade 5 second term (May - August)	52	2025-09-09 06:28:41.76
172f833e-36ce-4661-9ff4-db8a6e00da92	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 5 Term 3	Grade 5 third term (September - December)	53	2025-09-09 06:28:41.803
fc54e13d-d00b-482f-8f88-21a408b87ef1	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 6 Term 1	Grade 6 first term (January - April)	61	2025-09-09 06:28:41.85
de10c0f2-aeee-4def-ace3-c07e112e1f65	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 6 Term 2	Grade 6 second term (May - August)	62	2025-09-09 06:28:41.893
ed3fe3cc-814e-4a82-91aa-e4a9ef78bd64	55d91204-9e44-4c9f-8497-fb61a4e4a661	Grade 6 Term 3	Grade 6 third term (September - December)	63	2025-09-09 06:28:41.939
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.topics (id, examination_system_id, subject_id, level_id, term_id, title, description, summary_content, "order", created_at) FROM stdin;
topic-chem-f3-nitrogen	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Nitrogen and its Compounds	\N	\N	16	2025-09-09 06:29:21.272
topic-chem-f4-acids-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	3417984d-8cce-44ec-a8b2-19fffffbb873	Acids, Bases, and Salts (Revision & Expansion)	\N	\N	17	2025-09-09 06:29:21.32
topic-chem-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	3417984d-8cce-44ec-a8b2-19fffffbb873	Introduction to Chemistry	\N	\N	1	2025-09-09 06:29:20.548
topic-chem-f1-classify	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	3417984d-8cce-44ec-a8b2-19fffffbb873	Simple Classification of Substances	\N	\N	2	2025-09-09 06:29:20.598
topic-chem-f1-acids	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	4c42f549-5abd-431d-86fc-c2db6f83d43b	Acids, Bases, and Indicators	\N	\N	3	2025-09-09 06:29:20.646
topic-chem-f1-air	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	4c42f549-5abd-431d-86fc-c2db6f83d43b	Air and Combustion	\N	\N	4	2025-09-09 06:29:20.695
topic-chem-f1-water	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Water and Hydrogen	\N	\N	5	2025-09-09 06:29:20.743
topic-chem-f2-atom	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	60190057-a240-4429-b2a5-f770958d3865	3417984d-8cce-44ec-a8b2-19fffffbb873	Structure of the Atom and The Periodic Table	\N	\N	6	2025-09-09 06:29:20.791
topic-chem-f2-families	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	60190057-a240-4429-b2a5-f770958d3865	3417984d-8cce-44ec-a8b2-19fffffbb873	Chemical Families	\N	\N	7	2025-09-09 06:29:20.839
topic-chem-f2-bonding	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	60190057-a240-4429-b2a5-f770958d3865	4c42f549-5abd-431d-86fc-c2db6f83d43b	Structure and Bonding	\N	\N	8	2025-09-09 06:29:20.887
topic-chem-f2-salts	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	60190057-a240-4429-b2a5-f770958d3865	4c42f549-5abd-431d-86fc-c2db6f83d43b	Salts	\N	\N	9	2025-09-09 06:29:20.938
topic-chem-f2-electric	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	60190057-a240-4429-b2a5-f770958d3865	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Effect of an Electric Current on a Substance	\N	\N	10	2025-09-09 06:29:20.986
topic-chem-f3-mole	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	3417984d-8cce-44ec-a8b2-19fffffbb873	The Mole and Chemical Equations	\N	\N	11	2025-09-09 06:29:21.033
topic-chem-f3-gas	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	3417984d-8cce-44ec-a8b2-19fffffbb873	Gas Laws	\N	\N	12	2025-09-09 06:29:21.081
topic-chem-f3-organic1	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	4c42f549-5abd-431d-86fc-c2db6f83d43b	Organic Chemistry I	\N	\N	13	2025-09-09 06:29:21.128
topic-chem-f3-sulphur	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	4c42f549-5abd-431d-86fc-c2db6f83d43b	Sulphur and its Compounds	\N	\N	14	2025-09-09 06:29:21.176
topic-chem-f3-chlorine	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Chlorine and its Compounds	\N	\N	15	2025-09-09 06:29:21.224
topic-chem-f4-energy-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	3417984d-8cce-44ec-a8b2-19fffffbb873	Energy Changes in Chemical and Physical Processes	\N	\N	18	2025-09-09 06:29:21.371
topic-chem-f4-rates-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	4c42f549-5abd-431d-86fc-c2db6f83d43b	Reaction Rates and Reversible Reactions	\N	\N	19	2025-09-09 06:29:21.419
topic-chem-f4-electro-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	4c42f549-5abd-431d-86fc-c2db6f83d43b	Electrochemistry (Continuation)	\N	\N	20	2025-09-09 06:29:21.467
topic-chem-f4-metals-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Metals	\N	\N	21	2025-09-09 06:29:21.514
topic-chem-f4-organic2-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Organic Chemistry II (Alkanols and Alkanoic Acids)	\N	\N	22	2025-09-09 06:29:21.575
topic-chem-f4-radio-v2	bde2015e-8e30-4460-ad2b-c79837d9438b	18c89482-24b4-400f-af4f-f9616ae884c2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	bdaca442-6f9d-4ddb-9d92-7ae933ccc637	Radioactivity	\N	\N	23	2025-09-09 06:29:21.628
topic-phys-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Physics	Defines physics, its relationship with other subjects, career opportunities, and laboratory safety rules.	\N	1	2025-09-09 06:29:21.676
topic-phys-f1-measurements1	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Measurements I	Covers fundamental physical quantities (length, mass, time, etc.) and the use of basic measuring instruments.	\N	2	2025-09-09 06:29:21.722
topic-phys-f1-force	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Force	Introduces the concept of force, its effects, and different types of forces, including gravity and friction. Distinguishes between mass and weight.	\N	3	2025-09-09 06:29:21.771
topic-phys-f1-pressure	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Pressure	Explains the concept of pressure in solids, liquids, and gases, along with their applications.	\N	4	2025-09-09 06:29:21.819
topic-phys-f1-matter	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Particulate Nature of Matter	Explores the three states of matter (solids, liquids, and gases) based on the kinetic theory of matter.	\N	5	2025-09-09 06:29:21.867
topic-phys-f1-expansion	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Thermal Expansion	Deals with the expansion of solids, liquids, and gases when heated, and its applications and consequences.	\N	6	2025-09-09 06:29:21.914
topic-phys-f1-heat	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Heat Transfer	Covers the three modes of heat transfer: conduction, convection, and radiation.	\N	7	2025-09-09 06:29:21.963
topic-phys-f1-light	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Rectilinear Propagation and Reflection	Introduces the concept of light traveling in a straight line and its reflection on plane surfaces.	\N	8	2025-09-09 06:29:22.013
topic-phys-f1-electrostatics1	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Electrostatics I	Covers the basics of static electricity, including charging by friction and induction.	\N	9	2025-09-09 06:29:22.06
topic-phys-f1-circuits	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Cells and Simple Circuits	Introduces the components of a simple electric circuit and the function of a cell as a power source.	\N	10	2025-09-09 06:29:22.113
topic-phys-f2-magnetism	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Magnetism	Properties of magnets, magnetic fields, and the process of magnetization and demagnetization.	\N	1	2025-09-09 06:29:22.169
topic-phys-f2-measurements2	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Measurements II	Learning to use more precise measuring instruments like the Vernier caliper and micrometer screw gauge.	\N	2	2025-09-09 06:29:22.217
topic-phys-f2-moments	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Turning Effect of a Force	Introduces the concept of moments and the principle of moments, with applications in levers.	\N	3	2025-09-09 06:29:22.265
topic-phys-f2-equilibrium	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Equilibrium and Centre of Gravity	Explains different states of equilibrium and how the position of the center of gravity affects the stability of an object.	\N	4	2025-09-09 06:29:22.314
topic-phys-f2-mirrors	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Reflection at Curved Surfaces	Focuses on image formation by concave and convex mirrors.	\N	5	2025-09-09 06:29:22.362
topic-phys-f2-electromagnetic	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Magnetic Effect of an Electric Current	Studies the magnetic field produced by a current-carrying wire, leading to the study of electromagnets.	\N	6	2025-09-09 06:29:22.41
topic-phys-f2-hooke	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Hooke's Law	Introduces the relationship between force and extension in an elastic material.	\N	7	2025-09-09 06:29:22.457
topic-phys-f2-waves1	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Waves I	Covers the basic properties of waves and differentiates between transverse and longitudinal waves.	\N	8	2025-09-09 06:29:22.51
topic-phys-f2-sound	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Sound	Explains the nature, properties, and applications of sound waves.	\N	9	2025-09-09 06:29:22.556
topic-phys-f2-fluid	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Fluid Flow	Introduces the principles governing the flow of fluids, including streamline and turbulent flow.	\N	10	2025-09-09 06:29:22.604
topic-phys-f3-motion	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Linear Motion	Deals with the motion of objects in a straight line, including concepts like displacement, velocity, acceleration, and the equations of motion.	\N	1	2025-09-09 06:29:22.65
topic-phys-f3-newton	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Newton's Laws of Motion	Covers Newton's three laws of motion and their applications in everyday life.	\N	2	2025-09-09 06:29:22.697
topic-phys-f3-energy	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Work, Energy, Power and Machines	Explains the concepts of work, energy (kinetic and potential), and power. Also covers the study of simple machines.	\N	3	2025-09-09 06:29:22.746
topic-phys-f3-electricity2	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Current Electricity II	Expands on Form 1 topics, covering complex circuits, Ohm's Law, and factors affecting resistance.	\N	4	2025-09-09 06:29:22.792
topic-phys-f3-waves2	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Waves II	Covers more advanced wave concepts, including reflection, refraction, and superposition.	\N	5	2025-09-09 06:29:22.839
topic-phys-f3-electrostatics2	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Electrostatics II	Covers electrostatic induction in more detail, as well as the concepts of electric fields and capacitance.	\N	6	2025-09-09 06:29:22.887
topic-phys-f3-heating	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Heating Effect of an Electric Current	Focuses on the relationship between electrical energy and heat energy, including the formula H = I²Rt.	\N	7	2025-09-09 06:29:22.935
topic-phys-f3-heat-quantity	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Quantity of Heat	Deals with calculating heat changes, including specific heat capacity and specific latent heat.	\N	8	2025-09-09 06:29:22.983
topic-phys-f3-refraction	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Refraction of Light	Covers the bending of light as it passes between different media, including Snell's Law and total internal reflection.	\N	9	2025-09-09 06:29:23.03
topic-phys-f3-gas	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Gas Laws	Studies the relationships between pressure, volume, and temperature for gases.	\N	10	2025-09-09 06:29:23.078
topic-phys-f4-lenses	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Thin Lenses	Covers image formation by concave and convex lenses, including the lens formula and linear magnification.	\N	1	2025-09-09 06:29:23.125
topic-phys-f4-circular	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Uniform Circular Motion	Explains motion in a circle, including centripetal force and centripetal acceleration.	\N	2	2025-09-09 06:29:23.174
topic-phys-f4-floating	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Floating and Sinking	Revisits pressure in fluids, focusing on the principles of floatation and Archimedes' principle.	\N	3	2025-09-09 06:29:23.223
topic-phys-f4-spectrum	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Electromagnetic Spectrum	Students study the entire range of electromagnetic waves, their properties and applications.	\N	4	2025-09-09 06:29:23.27
topic-phys-f4-induction	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Electromagnetic Induction	Covers how a changing magnetic field can produce an electric current, leading to the principles of generators and transformers.	\N	5	2025-09-09 06:29:23.317
topic-phys-f4-mains	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Mains Electricity	Focuses on the generation, transmission, and use of electricity for domestic and industrial purposes.	\N	6	2025-09-09 06:29:23.37
topic-phys-f4-cathode	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Cathode Rays and Cathode Ray Tube	Covers the properties of cathode rays and the workings of a CRT.	\N	7	2025-09-09 06:29:23.416
topic-phys-f4-xrays	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	X-rays	Explains the production, properties, uses, and dangers of X-rays.	\N	8	2025-09-09 06:29:23.464
topic-phys-f4-photoelectric	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Photoelectric Effect	A modern physics topic explaining how light can cause the emission of electrons from a metal surface.	\N	9	2025-09-09 06:29:23.512
topic-phys-f4-radioactivity	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Radioactivity	Covers the nature of radioactivity, different types of radiation, half-life, and the uses and dangers of radioactive materials.	\N	10	2025-09-09 06:29:23.561
topic-phys-f4-electronics	bde2015e-8e30-4460-ad2b-c79837d9438b	eb371e93-ddef-421e-9ff9-05b36a454e12	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Electronics	Introduces the basics of electronics, including semiconductors, diodes, and transistors.	\N	11	2025-09-09 06:29:23.61
topic-bio-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Biology	Definition of biology, its branches, the importance of studying biology, and the characteristics of living organisms.	\N	1	2025-09-09 06:29:23.658
topic-bio-f1-classification1	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Classification I	Introduces the principles of classifying living organisms and the major taxonomic groups. Students also learn about the use of simple identification keys.	\N	2	2025-09-09 06:29:23.706
topic-bio-f1-cell	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	The Cell	Examines the cell as the basic unit of life, including the structure and function of various cell organelles in plant and animal cells.	\N	3	2025-09-09 06:29:23.758
topic-bio-f1-physiology	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Cell Physiology	Studies the functions of a cell, focusing on the movement of substances across the cell membrane through processes like diffusion, osmosis, and active transport.	\N	4	2025-09-09 06:29:23.809
topic-bio-f1-nutrition	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Nutrition in Plants and Animals	Covers the process of nutrition in living organisms, including photosynthesis in plants and different modes of feeding in animals.	\N	5	2025-09-09 06:29:23.856
topic-bio-f1-transport	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Transport in Plants and Animals	Explains the importance of transport systems and details the transport of water and nutrients in plants, as well as the circulatory systems in animals.	\N	6	2025-09-09 06:29:23.904
topic-bio-f1-gaseous	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Gaseous Exchange	Focuses on the process of gaseous exchange in both plants and animals, and the structures adapted for this function.	\N	7	2025-09-09 06:29:23.951
topic-bio-f2-respiration	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Respiration	Defines respiration, its importance, and the different types of respiration (aerobic and anaerobic) in living organisms.	\N	1	2025-09-09 06:29:24.002
topic-bio-f2-excretion	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Excretion and Homeostasis	Covers the removal of metabolic waste products from the body (excretion) and the maintenance of a constant internal environment (homeostasis).	\N	2	2025-09-09 06:29:24.051
topic-bio-f2-reproduction	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Reproduction in Plants and Animals	Explores the significance of reproduction and details both asexual and sexual reproduction in plants and animals.	\N	3	2025-09-09 06:29:24.099
topic-bio-f2-growth	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Growth and Development	Studies the processes of growth and development in living organisms, including metamorphosis in insects and growth curves in plants.	\N	4	2025-09-09 06:29:24.146
topic-bio-f2-classification2	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Classification II	Expands on Form 1's classification topic, providing a more detailed survey of the five kingdoms and their major phyla/divisions.	\N	5	2025-09-09 06:29:24.194
topic-bio-f3-ecology	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Ecology	Studies the relationship between living organisms and their environment, including ecosystems, energy flow, and nutrient cycling.	\N	1	2025-09-09 06:29:24.242
topic-bio-f3-genetics	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Genetics	Introduces the principles of heredity and variation. Key concepts include genes, chromosomes, Mendelian inheritance, and an overview of genetic disorders.	\N	2	2025-09-09 06:29:24.29
topic-bio-f3-evolution	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Evolution	Examines the theories and evidence of organic evolution, including natural selection and fossil records.	\N	3	2025-09-09 06:29:24.337
topic-bio-f3-health	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Human Health and Disease	Focuses on the causes, transmission, prevention, and control of common human diseases.	\N	4	2025-09-09 06:29:24.385
topic-bio-f3-irritability	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Irritability and Coordination in Plants	Explores how plants respond to stimuli through tropisms and nastic movements, and the role of plant hormones.	\N	5	2025-09-09 06:29:24.433
topic-bio-f4-support	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Support and Movement in Plants and Animals	Covers the various types of support systems in plants and animals, and the mechanisms of movement, including the human skeleton.	\N	1	2025-09-09 06:29:24.481
topic-bio-f4-coordination	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Coordination and Response in Animals	Details the nervous and endocrine systems in animals, and how they work together to coordinate responses to stimuli.	\N	2	2025-09-09 06:29:24.527
topic-bio-f4-senses	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	The Human Eye and Ear	Studies the structure and functions of the human eye and ear as specialized sense organs.	\N	3	2025-09-09 06:29:24.575
topic-bio-f4-human-reproduction	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Reproduction and Development in Humans	An in-depth look at the human reproductive system, fertilization, and the stages of growth and development from conception to birth.	\N	4	2025-09-09 06:29:24.623
topic-bio-f4-immunity	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Human Health and Immunity	Expands on human health, focusing on the immune system, its components, and different types of immunity.	\N	5	2025-09-09 06:29:24.671
topic-bio-f4-drugs	bde2015e-8e30-4460-ad2b-c79837d9438b	e391687a-3d73-447f-8942-28b4d9f0f33c	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Drugs and Drug Abuse	Identifies common drugs and explains the effects of drug abuse on the human body and society.	\N	6	2025-09-09 06:29:24.724
topic-math-f1-numbers	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Numbers and Operations	Covers whole numbers, fractions, decimals, and their operations, including place values, rounding off, and significant figures. Also includes divisibility tests.	\N	1	2025-09-09 06:29:24.771
topic-math-f1-algebra1	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Algebra I	Introduction to algebraic expressions, substitution, and simplification of linear equations. Includes brackets and factorization.	\N	2	2025-09-09 06:29:24.819
topic-math-f1-measurements	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Measurements	Covers length, mass, time, temperature, and money. Includes conversions and calculations involving area and volume of basic shapes.	\N	3	2025-09-09 06:29:24.866
topic-math-f1-geometry1	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Geometry I	Introduction to basic geometric concepts: points, lines, angles, and shapes. Includes constructions using ruler and compasses.	\N	4	2025-09-09 06:29:24.914
topic-math-f1-ratio	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Ratio, Proportion, and Rate	Explains the concepts of ratio, direct and inverse proportion, and rate. Includes practical applications like currency exchange rates.	\N	5	2025-09-09 06:29:24.961
topic-math-f1-percentages	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Percentages	Covers percentage increase and decrease, profit and loss, and simple interest.	\N	6	2025-09-09 06:29:25.009
topic-math-f1-commercial1	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Commercial Arithmetic I	Introduces basic financial mathematics concepts like discounts, commissions, salaries, and wages.	\N	7	2025-09-09 06:29:25.057
topic-math-f1-integers	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Integers	Covers positive and negative numbers, their representation on a number line, and operations involving them.	\N	8	2025-09-09 06:29:25.105
topic-math-f2-geometry2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Geometry II	Expands on Form 1 geometry, covering properties of triangles, quadrilaterals, and other polygons. Also includes angle properties of parallel lines.	\N	1	2025-09-09 06:29:25.153
topic-math-f2-measurements2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Measurements II	Focuses on the area of curved surfaces and the volume of cones, cylinders, and pyramids.	\N	2	2025-09-09 06:29:25.201
topic-math-f2-algebra2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Algebra II	Covers algebraic expressions and formulas, factorization of quadratic expressions, and solving linear inequalities.	\N	3	2025-09-09 06:29:25.248
topic-math-f2-circle	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	The Circle	Properties of chords and tangents to a circle. Includes calculations of arc length and sector area.	\N	4	2025-09-09 06:29:25.295
topic-math-f2-commercial2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Commercial Arithmetic II	Deals with compound interest, hire purchase, and income tax.	\N	5	2025-09-09 06:29:25.342
topic-math-f2-indices	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Indices and Logarithms	Explains the laws of indices and their applications. Introduces logarithms and their use in calculations.	\N	6	2025-09-09 06:29:25.39
topic-math-f2-coordinates	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Coordinates and Graphs	Covers Cartesian coordinates, plotting points, and drawing linear graphs. Includes finding the gradient of a line.	\N	7	2025-09-09 06:29:25.437
topic-math-f3-quadratic	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Quadratic Equations	Solving quadratic equations using factorization, completing the square, and the quadratic formula.	\N	1	2025-09-09 06:29:25.485
topic-math-f3-approximation	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Approximation and Errors	Discusses rounding off numbers and calculating absolute and relative errors. Includes the concept of error propagation.	\N	2	2025-09-09 06:29:25.533
topic-math-f3-trigonometry1	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Trigonometry I	Introduction to sine, cosine, and tangent ratios for right-angled triangles. Includes solving problems involving angles of elevation and depression.	\N	3	2025-09-09 06:29:25.581
topic-math-f3-commercial3	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Commercial Arithmetic III	Deals with foreign exchange, compound interest (further), and other commercial transactions.	\N	4	2025-09-09 06:29:25.629
topic-math-f3-surds	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Surds and Logarithms	Covers simplification of surds and solving logarithmic equations. Connects logarithms to indices.	\N	5	2025-09-09 06:29:25.678
topic-math-f3-vectors1	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Vectors I	Introduction to vectors, their representation, addition, and subtraction. Includes position vectors.	\N	6	2025-09-09 06:29:25.725
topic-bus-f1-office	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	The Office	Covers the functions of an office, office equipment, and the roles and responsibilities of office staff.	\N	6	2025-09-09 06:29:27.689
topic-math-f3-statistics1	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Statistics I	Covers collection and organization of data, measures of central tendency (mean, median, and mode), and graphical representation of data.	\N	7	2025-09-09 06:29:25.773
topic-math-f4-trigonometry2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Trigonometry II	Expands on Form 3, covering trigonometric identities, graphs of trigonometric functions, and solving trigonometric equations.	\N	1	2025-09-09 06:29:25.819
topic-math-f4-vectors2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Vectors II	Focuses on column vectors and their use in transformations. Includes applications in geometry.	\N	2	2025-09-09 06:29:25.867
topic-math-f4-matrices	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Matrices and Transformations	Introduces matrices, their operations, and their use in representing linear transformations like translation, rotation, and reflection.	\N	3	2025-09-09 06:29:25.913
topic-math-f4-statistics2	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Statistics II	Covers measures of dispersion (variance and standard deviation), and graphical representation of data using histograms and frequency polygons.	\N	4	2025-09-09 06:29:25.964
topic-math-f4-probability	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Probability	Explains the concepts of probability, combined events, and mutually exclusive events. Includes probability trees.	\N	5	2025-09-09 06:29:26.011
topic-math-f4-linear	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Linear Programming	Solving optimization problems by graphing linear inequalities and identifying feasible regions.	\N	6	2025-09-09 06:29:26.058
topic-math-f4-calculus	bde2015e-8e30-4460-ad2b-c79837d9438b	547ffc3a-b94d-4010-b5fd-b65773c12328	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Calculus (Differentiation and Integration)	Introduction to differentiation, finding the gradient of a curve, and applications in kinematics. Also covers the basics of integration.	\N	7	2025-09-09 06:29:26.107
topic-hist-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to History and Government	Defines history and government, their relationship, sources of historical information, and the importance of studying the subject.	\N	1	2025-09-09 06:29:26.155
topic-hist-f1-early-man	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	The Early Man	Covers the origin and evolution of man, cultural and economic practices of Early Man, and the transition from hunting and gathering to settled life.	\N	2	2025-09-09 06:29:26.202
topic-hist-f1-agriculture	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Development of Agriculture	Explores the origins of agriculture, the agrarian revolution, and the challenges of food security in Africa and the world.	\N	3	2025-09-09 06:29:26.249
topic-hist-f1-people-kenya	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	The People of Kenya Up to the 19th Century	Details the origin, migration, and settlement of various communities in Kenya, including the Bantu, Nilotes, and Cushites.	\N	4	2025-09-09 06:29:26.297
topic-hist-f1-socio-economic	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Socio-Economic and Political Organisation of Kenyan Communities in the 19th Century	Examines the social, political, and economic structures of Kenyan communities before the colonial period.	\N	5	2025-09-09 06:29:26.349
topic-hist-f1-contacts	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Contacts Between East Africa and the Outside World Up to the 19th Century	Covers the interactions between East African communities and visitors from the outside world, including Arabs, Persians, and Europeans.	\N	6	2025-09-09 06:29:26.398
topic-hist-f2-citizenship	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Citizenship	Defines citizenship, different types of citizenship, and the rights and responsibilities of a Kenyan citizen.	\N	1	2025-09-09 06:29:26.444
topic-hist-f2-integration	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	National Integration	Explores the meaning of national integration, factors that promote and hinder it, and strategies for fostering national unity in Kenya.	\N	2	2025-09-09 06:29:26.492
topic-hist-f2-trade	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Trade	Covers the history and development of trade, including regional and international trade routes.	\N	3	2025-09-09 06:29:26.54
topic-hist-f2-transport	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Development of Transport and Communication	Examines the evolution of transport and communication systems from early times to modern day.	\N	4	2025-09-09 06:29:26.588
topic-hist-f2-industry	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Development of Industry	Discusses the origins and evolution of industries, including the Industrial Revolution and its effects.	\N	5	2025-09-09 06:29:26.64
topic-hist-f2-urbanisation	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Urbanisation	Covers the historical development of urban centres and the social, economic, and political effects of urbanization.	\N	6	2025-09-09 06:29:26.688
topic-hist-f3-invasion	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	European Invasion of Africa and the Process of Colonisation	Examines the scramble for and partitioning of Africa, the reasons for European invasion, and the methods of colonial conquest.	\N	1	2025-09-09 06:29:26.736
topic-hist-f3-colonial-rule	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Establishment of Colonial Rule in Kenya	Details the establishment of British colonial administration in Kenya, including the role of the Imperial British East Africa Company (IBEACo).	\N	2	2025-09-09 06:29:26.784
topic-hist-f3-administration	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Colonial Administration	Covers the structures and policies of colonial administration, including direct and indirect rule, and the British system in Kenya.	\N	3	2025-09-09 06:29:26.832
topic-hist-f3-colonial-dev	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Socio-Economic Developments during the Colonial Period in Kenya	Focuses on changes in land, labor, agriculture, and infrastructure during the colonial era and their impact on Kenyan societies.	\N	4	2025-09-09 06:29:26.878
topic-hist-f3-independence	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Political Developments and the Struggle for Independence in Kenya (1919-1963)	Explores the rise of African nationalism and the various political struggles that led to Kenya's independence.	\N	5	2025-09-09 06:29:26.926
topic-hist-f3-leaders	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Lives and Contributions of Kenyan Leaders	Examines the roles and contributions of key Kenyan leaders who fought for independence and built the nation.	\N	6	2025-09-09 06:29:26.974
topic-hist-f3-government	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	The Formation, Structure, and Functions of the Government of Kenya	Introduces students to the three arms of government: the legislature, the executive, and the judiciary.	\N	7	2025-09-09 06:29:27.023
topic-hist-f4-world-wars	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	World Wars	Covers the causes, events, and results of the First and Second World Wars, and their global impact.	\N	1	2025-09-09 06:29:27.07
topic-hist-f4-international	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	International Relations	Explores the concept of international relations, including the formation and functions of international organizations like the United Nations (UN).	\N	2	2025-09-09 06:29:27.118
topic-hist-f4-cooperation	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Co-operation in Africa	Discusses the history of Pan-Africanism and the role of regional and continental bodies like the Organization of African Unity (OAU) and the African Union (AU).	\N	3	2025-09-09 06:29:27.166
topic-hist-f4-kenya-dev	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Social, Economic, and Political Developments and Challenges in Kenya Since Independence	Examines the changes and challenges Kenya has faced since 1963, including land issues, political changes, and economic policies.	\N	4	2025-09-09 06:29:27.213
topic-bus-f3-population	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Population and Employment	Examines population size, structure, and dynamics, and their relationship with employment and unemployment.	\N	6	2025-09-09 06:29:28.308
topic-hist-f4-africa-dev	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Social, Economic, and Political Developments and Challenges in Africa Since Independence	Analyzes the post-independence challenges and developments in Africa, including coups, civil wars, and economic reforms.	\N	5	2025-09-09 06:29:27.261
topic-hist-f4-electoral	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	The Electoral Process and Functions of Government in Other Parts of the World	Compares electoral systems and government functions in different countries, such as the UK and the USA.	\N	6	2025-09-09 06:29:27.309
topic-hist-f4-devolved	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Devolved Government	Focuses on the concept and structure of devolved government in Kenya, its functions, and challenges.	\N	7	2025-09-09 06:29:27.356
topic-hist-f4-revenue	bde2015e-8e30-4460-ad2b-c79837d9438b	2e17eb44-e3ea-4e0e-a0d3-1e1825a04596	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Public Revenue and Expenditure in Kenya	Covers the sources of public revenue, how the government spends its money, and the role of institutions like the Kenya Revenue Authority (KRA).	\N	8	2025-09-09 06:29:27.404
topic-bus-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Business Studies	Defines business studies, its various components (e.g., economics, commerce, accounting), and the importance of studying the subject.	\N	1	2025-09-09 06:29:27.452
topic-bus-f1-environment	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Business and Its Environment	Examines the purpose of a business, types of business activities, and the various internal and external environments that affect a business's operations.	\N	2	2025-09-09 06:29:27.498
topic-bus-f1-wants	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Satisfaction of Human Wants	Covers the characteristics of human wants, types of goods and services, and the concepts of scarcity, choice, and opportunity cost.	\N	3	2025-09-09 06:29:27.546
topic-bus-f1-production	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Production	Explains the meaning of production, types of production, factors of production, and the concept of division of labor and specialization.	\N	4	2025-09-09 06:29:27.593
topic-bus-f1-entrepreneurship	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Entrepreneurship	Introduces entrepreneurship, qualities of a good entrepreneur, and the importance of entrepreneurship in economic development.	\N	5	2025-09-09 06:29:27.641
topic-bus-f2-home-trade	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Home Trade	Examines the different types of retail and wholesale trade, channels of distribution, and factors influencing home trade.	\N	1	2025-09-09 06:29:27.737
topic-bus-f2-forms	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Forms of Business Units	Covers the different forms of business ownership, including sole proprietorships, partnerships, and companies, and their advantages and disadvantages.	\N	2	2025-09-09 06:29:27.785
topic-bus-f2-government	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Government and Business	Discusses the role of the government in business, including regulations, taxation, and the provision of public services.	\N	3	2025-09-09 06:29:27.833
topic-bus-f2-transport	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Transport	Explains the role and importance of transport, and the different modes of transport (road, rail, water, and air).	\N	4	2025-09-09 06:29:27.881
topic-bus-f2-communication	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Communication	Covers the meaning and types of communication, and the importance of effective communication in business.	\N	5	2025-09-09 06:29:27.928
topic-bus-f2-warehousing	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Warehousing	Discusses the functions and types of warehouses, and the importance of storage in business.	\N	6	2025-09-09 06:29:27.976
topic-bus-f2-insurance	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Insurance	Introduces the concept of insurance, principles of insurance, and different classes of insurance policies.	\N	7	2025-09-09 06:29:28.023
topic-bus-f3-demand-supply	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Demand and Supply	Explains the concepts of demand and supply, the law of demand and supply, and how equilibrium price is determined.	\N	1	2025-09-09 06:29:28.071
topic-bus-f3-size-location	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Size and Location of a Firm	Covers the factors that influence the size and location of a business, as well as the concepts of economies and diseconomies of scale.	\N	2	2025-09-09 06:29:28.118
topic-bus-f3-markets	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Product Markets	Examines different types of market structures, including perfect competition, monopoly, and oligopoly.	\N	3	2025-09-09 06:29:28.166
topic-bus-f3-distribution	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	The Chain of Distribution	Discusses the various channels through which goods move from producers to consumers, including the roles of intermediaries.	\N	4	2025-09-09 06:29:28.213
topic-bus-f3-national-income	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	National Income	Introduces the concept of national income, its measurement, and the factors affecting it.	\N	5	2025-09-09 06:29:28.26
topic-bus-f3-transactions	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Business Transactions	Covers business documents, books of original entry, and the accounting process.	\N	7	2025-09-09 06:29:28.355
topic-bus-f4-documents	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Source Documents and Books of Original Entry	A more detailed look at business documents and their use in accounting, including ledgers and cash books.	\N	1	2025-09-09 06:29:28.404
topic-bus-f4-statements	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Financial Statements	Focuses on the preparation and analysis of financial statements, including the Trading, Profit and Loss account, and Balance Sheet.	\N	2	2025-09-09 06:29:28.451
topic-bus-f4-banking	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Money and Banking	Covers the meaning and functions of money, the development of banking, and the role of the Central Bank.	\N	3	2025-09-09 06:29:28.498
topic-bus-f4-finance	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Public Finance	Examines government revenue (taxation) and expenditure, and the role of public finance in the economy.	\N	4	2025-09-09 06:29:28.546
topic-bus-f4-inflation	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Inflation	Discusses the meaning, causes, and effects of inflation on an economy.	\N	5	2025-09-09 06:29:28.594
topic-bus-f4-trade	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	International Trade	Covers the reasons for and benefits of international trade, trade restrictions, and balance of payments.	\N	6	2025-09-09 06:29:28.642
topic-bus-f4-development	bde2015e-8e30-4460-ad2b-c79837d9438b	c0ead570-cd77-4b08-be0e-608ac87fe7c7	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Economic Development and Planning	Explains the meaning of economic development, indicators of development, and the role of economic planning.	\N	7	2025-09-09 06:29:28.689
topic-comp-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Computers	Defines a computer, its characteristics, historical development, and the importance of computers in society. Also covers safety precautions in the computer lab.	\N	1	2025-09-09 06:29:28.737
topic-comp-f1-systems	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Computer Systems	Explains the elements of a computer system: hardware, software, and liveware. Details the functions of various hardware components like input devices, the Central Processing Unit (CPU), and output devices.	\N	2	2025-09-09 06:29:28.786
topic-comp-f1-os	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Operating Systems	Covers the definition, functions, and types of operating systems. Also includes file management, disk management, and how to install an operating system.	\N	3	2025-09-09 06:29:28.833
topic-comp-f2-spreadsheets	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Spreadsheets	Explains the purpose and components of a spreadsheet. Students learn to use formulas and functions, manage data, and create charts.	\N	2	2025-09-09 06:29:28.929
topic-comp-f2-databases	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Databases	Covers database concepts, different database models, and how to create and manipulate a simple database in a database management system.	\N	3	2025-09-09 06:29:28.978
topic-comp-f2-desktop	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Desktop Publishing	Introduces the concept and purpose of desktop publishing software for designing and producing publications like newsletters and brochures.	\N	4	2025-09-09 06:29:29.025
topic-comp-f2-internet	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Internet and E-mail	Covers the history and development of the internet, its importance, and how to use internet services like web browsing and e-mail.	\N	5	2025-09-09 06:29:29.073
topic-comp-f3-data-rep	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Data Representation in a Computer	Explains how data is represented in a computer using binary digits. Includes different number systems (binary, decimal, octal, hexadecimal) and binary arithmetic operations.	\N	1	2025-09-09 06:29:29.119
topic-comp-f3-processing	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Data Processing	Discusses the data processing cycle, types of files, file organization methods, and different data processing modes.	\N	2	2025-09-09 06:29:29.167
topic-comp-f3-programming	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Elementary Programming Principles	Introduces programming concepts, levels of programming languages, and program development. Includes designing algorithms using flowcharts and pseudocode.	\N	3	2025-09-09 06:29:29.213
topic-comp-f3-system-dev	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	System Development	Covers the concept of a system, information systems, and the stages of the System Development Life Cycle (SDLC).	\N	4	2025-09-09 06:29:29.26
topic-comp-f4-networking	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Networking and Data Communication	Explains the concepts of computer networks, types of networks (LAN, MAN, WAN), network topologies, and the benefits and limitations of networking.	\N	1	2025-09-09 06:29:29.308
topic-comp-f4-applications	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Application Areas of ICT	Covers the use of Information and Communication Technology (ICT) in various sectors like education, business, transport, and law enforcement.	\N	2	2025-09-09 06:29:29.356
topic-comp-f4-impact	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Impact of ICT on Society	Discusses the positive and negative effects of computers on society, including issues related to ethics, privacy, and health.	\N	3	2025-09-09 06:29:29.404
topic-comp-f4-careers	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Careers in ICT	Identifies various career opportunities in the field of ICT and the skills required for each.	\N	4	2025-09-09 06:29:29.451
topic-comp-f4-project	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Computer Project	This is a practical project where students apply the skills and knowledge acquired throughout the course to develop a complete system, from analysis to implementation.	\N	5	2025-09-09 06:29:29.499
topic-agri-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Agriculture	Defines agriculture, its importance in Kenya, and the challenges faced by farmers. Also covers historical development and the relationship between agriculture and other subjects.	\N	1	2025-09-09 06:29:29.546
topic-agri-f1-factors	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Factors Influencing Agriculture	Examines the various ecological (e.g., climate, soil, pests) and economic (e.g., market, transport, capital) factors that influence agricultural production.	\N	2	2025-09-09 06:29:29.596
topic-agri-f1-tools	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Tools and Equipment	Covers the identification, uses, and maintenance of various hand tools and equipment used in farming.	\N	3	2025-09-09 06:29:29.644
topic-agri-f1-crop1	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Crop Production I	Explains the processes involved in crop production, from land preparation and planting to harvesting and marketing.	\N	4	2025-09-09 06:29:29.691
topic-agri-f2-soil1	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Soil Fertility I	Introduces the concept of soil fertility, the components of soil, and methods of maintaining and improving soil fertility.	\N	1	2025-09-09 06:29:29.739
topic-agri-f2-livestock1	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Livestock Production I	Covers the common livestock in Kenya, including cattle, poultry, and goats. Students learn about different breeds and their general management.	\N	2	2025-09-09 06:29:29.786
topic-agri-f2-economics1	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Agricultural Economics I	Explains basic economic concepts in agriculture, such as land tenure, farm records, and marketing.	\N	3	2025-09-09 06:29:29.834
topic-agri-f2-crop2	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Crop Production II	Expands on Form 1 topics, focusing on specific crops like maize, wheat, and coffee, and their cultivation practices.	\N	4	2025-09-09 06:29:29.882
topic-agri-f3-soil2	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Soil Fertility II	A more detailed look at soil fertility, including soil conservation, manuring, and the use of fertilizers.	\N	1	2025-09-09 06:29:29.929
topic-agri-f3-livestock2	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Livestock Production II	Covers advanced topics in livestock production, including nutrition, breeding, and disease control.	\N	2	2025-09-09 06:29:29.976
topic-agri-f3-economics2	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Agricultural Economics II	Deals with advanced agricultural economics, including farm planning, budgeting, and sources of agricultural finance.	\N	3	2025-09-09 06:29:30.024
topic-agri-f4-pests	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Pests and Diseases of Crops	Covers the identification of common crop pests and diseases and their control methods. Includes both chemical and non-chemical methods.	\N	1	2025-09-09 06:29:30.072
topic-agri-f4-weeds	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Weeds	Explains the types of weeds, their effects, and the various methods of weed control.	\N	2	2025-09-09 06:29:30.118
topic-agri-f4-structures	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Agricultural Structures	Discusses the construction and maintenance of farm structures like fences, barns, and animal housing.	\N	3	2025-09-09 06:29:30.166
topic-agri-f4-machinery	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Farm Power and Machinery	Covers the use and maintenance of different farm machinery, including tractors and irrigation equipment.	\N	4	2025-09-09 06:29:30.213
topic-agri-f4-processing	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Agricultural Products Processing	Introduces the basic methods of processing and preserving agricultural produce to increase shelf life and value.	\N	5	2025-09-09 06:29:30.261
topic-agri-f4-environment	bde2015e-8e30-4460-ad2b-c79837d9438b	4f203b72-a622-40f0-8d13-b7cf5ef6c284	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Environmental Pollution and Conservation	Examines the causes and effects of environmental pollution from agricultural activities and the importance of conservation.	\N	6	2025-09-09 06:29:30.309
topic-home-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Home Science	Defines Home Science and its importance in daily life. Covers the scope of Home Science and its relationship with other subjects.	\N	1	2025-09-09 06:29:30.356
topic-home-f1-nutrition	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Food and Nutrition	Introduces the different food nutrients, their sources, and functions in the body. Covers meal planning for different groups and balanced diets.	\N	2	2025-09-09 06:29:30.404
topic-home-f1-kitchen	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	The Kitchen	Covers the layout of a good kitchen, kitchen tools and equipment, and basic food preparation methods.	\N	3	2025-09-09 06:29:30.452
topic-home-f1-fabric	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Fabric and Garment Construction I	Introduces different types of fabrics, their properties, and basic hand stitches. Students also learn how to use a sewing machine.	\N	4	2025-09-09 06:29:30.5
topic-home-f1-laundry	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	Laundry Work I	Covers the principles of laundry, sorting clothes, and basic laundering processes for different fabrics.	\N	5	2025-09-09 06:29:30.546
topic-home-f2-home	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	The Home	Examines the characteristics of a healthy home and its components. Covers household chores and home maintenance.	\N	1	2025-09-09 06:29:30.594
topic-home-f2-first-aid	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	First Aid	Introduces the principles of first aid and how to handle common home accidents and emergencies.	\N	2	2025-09-09 06:29:30.641
topic-home-f2-consumer	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Consumer Education	Covers consumer rights and responsibilities, sources of consumer information, and how to make informed choices.	\N	3	2025-09-09 06:29:30.691
topic-home-f2-finance	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Family Finance	Discusses budgeting, saving, and managing family income and expenditure. Covers basic financial documents.	\N	4	2025-09-09 06:29:30.737
topic-home-f2-preservation	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Food Preservation and Storage	Explains the reasons for preserving food and the various methods used for food preservation and storage.	\N	5	2025-09-09 06:29:30.785
topic-home-f3-hygiene	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Hygiene and Grooming	Covers personal hygiene, cleanliness, and the importance of good grooming and appearance.	\N	1	2025-09-09 06:29:30.832
topic-home-f3-childcare	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	Child Care and Development	Examines the needs of a child, the stages of child development, and the importance of immunisation.	\N	2	2025-09-09 06:29:30.88
topic-home-f3-clothing	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Clothing and Fashion	Discusses clothing selection, care of clothes, and the influence of fashion on dressing.	\N	3	2025-09-09 06:29:30.928
topic-home-f3-housing	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Housing	Covers the importance of housing, different types of housing, and factors to consider when choosing a house.	\N	4	2025-09-09 06:29:30.979
topic-home-f3-pests	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Household Pests	Identifies common household pests, their effects on the family, and methods of controlling them.	\N	5	2025-09-09 06:29:31.027
topic-home-f4-textiles	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Textiles and Fibres	A more detailed look at different types of textile fibres, their properties, and their uses in fabric production.	\N	1	2025-09-09 06:29:31.075
topic-home-f4-garment2	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Garment Construction II	Expands on Form 1 topics, focusing on more complex garment construction, including pattern drafting and various types of seams and finishes.	\N	2	2025-09-09 06:29:31.123
topic-home-f4-etiquette	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Kitchen and Dining Room Etiquette	Covers table setting, dining etiquette, and proper manners for different social occasions.	\N	3	2025-09-09 06:29:31.171
topic-home-f4-diet	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Diet and Diseases	Discusses the relationship between diet and diseases. Covers nutritional deficiencies and lifestyle diseases.	\N	4	2025-09-09 06:29:31.218
topic-home-f4-project	bde2015e-8e30-4460-ad2b-c79837d9438b	1a5f3bd2-72ee-46f6-9cc3-d2b2c84e51e3	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Home Science Project	A practical project that requires students to apply their skills in areas like garment construction, cooking, or home management.	\N	5	2025-09-09 06:29:31.266
topic-music-f1-intro	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Introduction to Music	Defines music, its elements, and its importance in society. Also covers the different branches of music.	\N	1	2025-09-09 06:29:31.319
topic-music-f1-elements	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	05408d45-33aa-421e-96b6-3ebfb59505b7	Elements of Music	Covers the fundamental elements of music, including rhythm, melody, harmony, and dynamics.	\N	2	2025-09-09 06:29:31.367
topic-music-f1-western	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	60f822aa-54ac-4066-9b99-79f38a8345d6	Western Musical Instruments	Identifies and classifies Western musical instruments, including those in the orchestra. Students learn to distinguish between string, woodwind, brass, and percussion instruments.	\N	3	2025-09-09 06:29:31.415
topic-music-f1-african	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	bba42fb1-b8c6-41e0-b24f-a3a0ed71d5a5	99f82484-1bee-4fae-b2a1-cd33c223874f	African Traditional Instruments	Examines the various categories of African musical instruments (e.g., idiophones, chordophones, aerophones) and their functions in different communities.	\N	4	2025-09-09 06:29:31.463
topic-music-f2-forms	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Forms of Music	Introduces different musical forms like binary, ternary, and rondo forms. Also covers African musical forms.	\N	1	2025-09-09 06:29:31.511
topic-music-f2-melody	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Melody	A more detailed look at melody, including melodic intervals, scales (major and minor), and different types of melodic movement.	\N	2	2025-09-09 06:29:31.558
topic-music-f2-harmony	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	60190057-a240-4429-b2a5-f770958d3865	52b4a255-8747-4e3a-a4e9-392b63cca41b	Harmony	Covers the concepts of harmony, chords (triads), and simple chord progressions. Students learn to build and identify basic chords.	\N	3	2025-09-09 06:29:31.606
topic-music-f2-rhythm	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	60190057-a240-4429-b2a5-f770958d3865	c790f336-21ed-491f-ae27-218477d622c1	Rhythm and Metre	Examines complex rhythmic patterns, time signatures, and syncopation. Students learn to clap and count complex rhythms.	\N	4	2025-09-09 06:29:31.653
topic-music-f3-history	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	c03f9705-e64b-438d-af6e-4e4b0f2e8093	7f51575a-0c6f-4b7a-b9ae-f9b9c9c0b0ea	History of Western Music	Covers the major periods of Western music history, including the Baroque, Classical, and Romantic periods, and their key composers.	\N	1	2025-09-09 06:29:31.7
topic-music-f3-set-works	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	c03f9705-e64b-438d-af6e-4e4b0f2e8093	c79e5e7a-1226-4ee8-97d4-c4601380e64c	Set Works	A detailed study of specific musical compositions chosen by the Kenya National Examinations Council (KNEC). Students analyse these pieces in detail.	\N	2	2025-09-09 06:29:31.748
topic-music-f3-composition	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	c03f9705-e64b-438d-af6e-4e4b0f2e8093	e068a27b-c6c3-4662-9445-e4c8abd691d6	Composition	Introduces the principles of musical composition, including writing melodies, harmonizing, and arranging music for different instruments.	\N	3	2025-09-09 06:29:31.796
topic-music-f4-orchestral	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	66e1c25d-5290-4979-b0f9-c505ce1e8859	Orchestral and Band Instruments	A more in-depth study of the orchestra, including the seating arrangement and the roles of different instrumental sections.	\N	1	2025-09-09 06:29:31.844
topic-music-f4-aural	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	8c7661b2-05ab-4eb4-9507-205243c23618	Aural Training	Develops the student's listening skills, including identifying intervals, chords, and rhythmic patterns by ear.	\N	2	2025-09-09 06:29:31.892
topic-comp-f2-word	bde2015e-8e30-4460-ad2b-c79837d9438b	0b2d3407-3fc3-49e6-b652-1e6917e2ead2	60190057-a240-4429-b2a5-f770958d3865	425c888f-db9f-436d-8982-808647749dce	Word Processors	Introduces word processing software, including creating, editing, and formatting documents, as well as creating tables and mail merge documents.	# Computer Studies - Form 2 Notes\n\n## Topic: Word Processors\n\n### Introduction to Word Processors\n\nA **word processor** is a software application used for creating, editing, formatting, and printing text documents. Unlike traditional typewriters, word processors offer a variety of features that enhance document creation and management.\n\n### Key Features of Word Processors\n\n1. **Document Creation**  \n   Word processors allow users to create documents from scratch or modify existing ones. Common word processing software includes:\n   - Microsoft Word\n   - Google Docs\n   - LibreOffice Writer\n\n2. **Editing Tools**  \n   Users can easily edit text using features such as:\n   - Cut, Copy, and Paste\n   - Undo and Redo\n   - Find and Replace\n\n3. **Formatting Options**  \n   Formatting tools enhance the appearance of documents. These include:\n   - Font styles (bold, italic, underline)\n   - Font sizes\n   - Text color\n   - Paragraph alignment (left, center, right, justified)\n\n4. **Inserting Elements**  \n   Word processors allow the insertion of various elements to enrich documents:\n   - Images\n   - Tables\n   - Hyperlinks\n   - Shapes\n\n5. **Spell Check and Grammar Check**  \n   Most word processors come with built-in spelling and grammar checkers to help improve the quality of the text.\n\n### Creating a Document\n\n#### Steps to Create a Document\n\n1. **Open the Word Processor**  \n   Launch your chosen word processing software.\n\n2. **Create a New Document**  \n   Click on "File" > "New" or use the shortcut `Ctrl + N` (for Windows) or `Cmd + N` (for Mac).\n\n3. **Type Your Content**  \n   Start typing your document. Use the editing tools to correct errors or change text as necessary.\n\n#### Example  \n*Creating a simple letter:*\n```\n[Your Name]  \n[Your Address]  \n[City, State, Zip Code]  \n[Email Address]  \n[Date]  \n\nDear [Recipient's Name],\n\nI hope this message finds you well. I am writing to inform you about...\n\nSincerely,  \n[Your Name]\n```\n\n### Editing and Formatting Documents\n\n#### Editing Techniques\n\n- **Cut, Copy, and Paste**  \n   - **Cut**: Removes selected text and places it in the clipboard.\n   - **Copy**: Duplicates selected text to the clipboard without removing it.\n   - **Paste**: Inserts the text from the clipboard to the desired location.\n\n- **Find and Replace**  \n   Use this feature to search for specific words or phrases and replace them with others to save time.\n\n#### Formatting Text\n\n- **Changing Font Style and Size**  \n   Select the text and choose the desired font style and size from the toolbar.\n\n- **Adding Bullets and Numbering**  \n   Use the bullet or numbering options in the toolbar to create lists.\n\n- **Paragraph Alignment**  \n   Highlight the paragraph and select the alignment option (left, center, right, justified) from the toolbar.\n\n### Creating Tables\n\nTables are useful for organizing data and presenting information clearly.\n\n#### Steps to Create a Table\n\n1. **Insert a Table**  \n   Click on "Insert" > "Table" and select the number of rows and columns required.\n\n2. **Enter Data**  \n   Click on each cell to enter the required data.\n\n3. **Formatting the Table**  \n   Use the table design options to adjust borders, shading, and text alignment within the table.\n\n#### Example  \n*Creating a simple table for student grades:*\n\n| Student Name  | Subject   | Grade |\n|---------------|-----------|-------|\n| John Doe      | Mathematics| A     |\n| Jane Smith    | English   | B     |\n| Samuel Kim    | Science   | A-    |\n\n### Mail Merge\n\nMail merge is a powerful feature that allows you to create personalized documents for multiple recipients.\n\n#### Steps to Perform Mail Merge\n\n1. **Create a Main Document**  \n   This document contains the static content (e.g., a letter template).\n\n2. **Create a Data Source**  \n   This could be a list of recipients stored in a spreadsheet or database.\n\n3. **Link Data Source to Main Document**  \n   Use the mail merge feature to connect the data source.\n\n4. **Insert Merge Fields**  \n   Place merge fields (e.g., name, address) in the main document where personalization is needed.\n\n5. **Finish the Merge**  \n   Complete the process to generate individual documents for each recipient.\n\n#### Example  \n*Creating personalized letters for students:*\n```\nDear <<FirstName>>,\n\nCongratulations on your achievement in the recent examinations!\n\nBest,  \n[Your Name]\n```\n\n### Practical Applications\n\n- **Business Use**: Companies use word processors for reports, memos, and official correspondence.\n- **Educational Use**: Students use word processing tools for essays, assignments, and projects.\n- **Personal Use**: Individuals create resumes, cover letters, and personal documents.\n\n### Conclusion\n\nWord processors are essential tools in modern education and business. Mastering their features can significantly enhance productivity and the quality of documents produced. Practice using different features in your word processing software to become more proficient.\n\n### Summary of Key Terms\n\n- **Word Processor**: A software application for creating and editing text documents.\n- **Formatting**: Adjusting the appearance of text and paragraphs.\n- **Mail Merge**: A feature that creates personalized documents for multiple recipients.\n- **Table**: A structured arrangement of data in rows and columns.\n\n--- \n\nThese notes provide an overview of word processors, focusing on their functionality, practical applications, and operation. Remember to practice using these features to improve your skills!	1	2025-09-09 06:29:28.881
topic-music-f4-society	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Music in Society	Examines the role of music in various social contexts, including ceremonies, entertainment, and communication.	# Music in Society: Form 4 Music Notes\n\n## Introduction\nMusic is an integral part of human culture and society. It serves various functions across different social contexts, including ceremonies, entertainment, and communication. Understanding the role of music in society helps us appreciate its significance in cultural identity and social cohesion.\n\n## Key Concepts\n\n### 1. Definition of Music\n- **Music**: An art form consisting of sound combined in a way that is pleasing to the ear. It involves elements such as melody, harmony, rhythm, and timbre.\n\n### 2. Functions of Music in Society\nMusic serves multiple purposes within social contexts:\n\n#### A. Ceremonial Functions\n- **Rituals and Traditions**: Music plays a vital role in ceremonies such as weddings, funerals, and initiation rites. For example, in many Kenyan cultures, traditional songs accompany weddings to celebrate union and love.\n- **Religious Practices**: In churches and mosques, music is used to enhance worship. Hymns, chants, and gospel music are common in Christian services, while Nasheeds are popular in Islamic gatherings.\n\n#### B. Entertainment\n- **Performances**: Music is a primary form of entertainment, evident in concerts, festivals, and cultural events. Events like the **Lake of Stars Festival** in Malawi draw attendees for musical performances.\n- **Media and Technology**: The rise of digital platforms like YouTube and Spotify has transformed how music is consumed, allowing artists to reach global audiences.\n\n#### C. Communication\n- **Social Commentary**: Music can serve as a form of expression and protest. For instance, Kenyan artists like **Eric Wainaina** use their music to address social issues such as corruption and governance.\n- **Cultural Identity**: Traditional music often communicates cultural heritage and values, acting as a bridge between generations. \n\n## Examples of Music in Social Contexts\n\n### 1. Ceremonies\n- **Weddings**: In Kikuyu weddings, traditional songs are performed to bless the couple, showcasing cultural values and community support.\n- **Funerals**: In Luo culture, mourners often sing dirges to honor the deceased, reflecting grief and community solidarity.\n\n### 2. Entertainment\n- **Local Festivals**: Events like the **Safi Safari Festival** celebrate local artistry and provide a platform for musicians to reach wider audiences.\n- **Dance**: Traditional dances accompanied by music, such as the Maasai jumping dance, celebrate cultural heritage and community togetherness.\n\n### 3. Communication\n- **Protest Songs**: Artists like **Sautisol** use their music to comment on societal issues, resonating with the youth and fostering awareness.\n- **Storytelling**: Traditional songs often narrate historical events, keeping the community's history alive. For example, songs about the Mau Mau liberation movement play a crucial role in Kenyan history.\n\n## Practical Applications\n\n### 1. Participation in Local Music\n- Encourage students to participate in school bands, choirs, or local music groups to experience music as a communal activity.\n\n### 2. Analysis of Music in Media\n- Students can analyze popular songs and their lyrics to explore themes of social justice, identity, and cultural expression.\n\n### 3. Cultural Research Projects\n- Assign research projects on different Kenyan ethnic groups' music, exploring its role in ceremonies and daily life.\n\n## Conclusion\nMusic is a powerful tool that shapes and reflects societal norms, values, and emotions. By examining its varied roles in ceremonies, entertainment, and communication, students can gain a deeper understanding of their cultural identity and the world around them. Engaging with music not only enhances appreciation for the arts but also fosters social cohesion and cultural pride. \n\n## Key Takeaways\n- Music serves ceremonial, entertainment, and communicative functions in society.\n- Different cultures use music to express identity and values.\n- Engaging with music can enhance social awareness and cultural appreciation.\n\n---\n\nThese notes provide a comprehensive overview of the role of music in society, aligning with the Form 4 curriculum. Students are encouraged to explore these themes further in their studies and practical applications.	4	2025-09-09 06:29:31.988
topic-music-f4-dictation	bde2015e-8e30-4460-ad2b-c79837d9438b	78a96ad4-6fe1-4209-8839-c0dd7c8b01bd	9fd192de-ef62-4e53-8f0a-bcfef16d6cb0	0a7bc4ed-b6a9-4559-a9c2-7820c7e29a7c	Musical Dictation	A practical skill where students write down short melodies or rhythms played by the teacher. This is a crucial component of the final exam.		3	2025-09-09 06:29:31.94
\.


--
-- Data for Name: trophies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.trophies (id, title, description, icon, created_at) FROM stdin;
gold-trophy	Gold	Top performer of the month	🥇	2025-09-09 06:31:41.464
silver-trophy	Silver	Second best performer	🥈	2025-09-09 06:31:41.522
bronze-trophy	Bronze	Third best performer	🥉	2025-09-09 06:31:41.573
\.


--
-- Data for Name: user_answers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_answers (id, quiz_session_id, question_id, user_answer, is_correct, time_spent, answered_at) FROM stdin;
\.


--
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_badges (id, user_id, badge_id, count, streaks, last_earned_at, created_at, updated_at) FROM stdin;
34b821d4-ee62-4818-9146-5fcb27e62110	demo-student-1	quiz-master	1	\N	2025-09-20 10:05:00	2025-09-20 10:05:00	2025-09-20 10:05:00
c524b9d9-3fb5-412a-a506-fdeb614d933f	demo-student-2	quiz-master	1	\N	2025-09-21 14:04:00	2025-09-21 14:04:00	2025-09-21 14:04:00
10ac56cd-0533-482e-a041-b4950802299d	demo-student-3	quiz-master	1	\N	2025-09-22 09:37:00	2025-09-22 09:37:00	2025-09-22 09:37:00
\.


--
-- Data for Name: user_challenge_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_challenge_progress (id, profile_id, challenge_id, current_value, completed, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: user_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_challenges (id, user_id, challenge_id, completed, progress, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_preference_changes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_preference_changes (id, user_id, profile_id, change_type, previous_value, new_value, "timestamp", is_active) FROM stdin;
\.


--
-- Data for Name: user_spark_boost; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_spark_boost (id, from_user_id, to_user_id, sparks, created_at) FROM stdin;
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_subscriptions (id, user_id, plan_id, status, start_date, end_date, auto_renew, payment_method, paystack_customer_code, paystack_subscription_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_trophies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_trophies (id, user_id, trophy_id, count, last_earned_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, first_name, last_name, profile_image_url, default_profile_id, is_premium, credits, is_active, email_verified, needs_password_setup, last_login_at, created_at, updated_at) FROM stdin;
8eb5cca0-43c2-4fc3-a535-466027153128	josiahkamau180@gmail.com	$2b$12$yEidtQqAFfWK81joOu2eKOKOkLVN3juiddayjQuuPd71qF3.hp7ri	j	j	\N	7b73b64b-4510-4ad6-a954-1b4ecb2b7a9a	f	0.00	t	f	f	\N	2025-09-18 15:18:33.564604	2025-09-18 15:19:01.18
demo-student-1	aisha.mohamed@student.com	\N	Aisha	Mohamed	https://images.unsplash.com/photo-1494790108755-2616b612b134?w=100	demo-profile-1	f	0.00	t	f	f	\N	2025-09-09 06:28:39.198	2025-09-09 06:28:39.198
demo-student-2	brian.kipkoech@student.com	\N	Brian	Kipkoech	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100	demo-profile-2	f	0.00	t	f	f	\N	2025-09-09 06:28:39.244	2025-09-09 06:28:39.244
demo-student-3	christine.wanjiku@student.com	\N	Christine	Wanjiku	https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100	demo-profile-3	f	0.00	t	f	f	\N	2025-09-09 06:28:39.288	2025-09-09 06:28:39.288
demo-student-4	david.otieno@student.com	\N	David	Otieno	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100	demo-profile-4	f	0.00	t	f	f	\N	2025-09-09 06:28:39.334	2025-09-09 06:28:39.334
demo-student-5	esther.kamau@student.com	\N	Esther	Kamau	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100	demo-profile-5	f	0.00	t	f	f	\N	2025-09-09 06:28:39.377	2025-09-09 06:28:39.377
demo-student-6	felix.mutua@student.com	\N	Felix	Mutua	https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100	demo-profile-6	f	0.00	t	f	f	\N	2025-09-09 06:28:39.42	2025-09-09 06:28:39.42
\.


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (sid);


--
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: badge_types badge_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badge_types
    ADD CONSTRAINT badge_types_pkey PRIMARY KEY (id);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: daily_challenges daily_challenges_date_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_date_unique UNIQUE (date);


--
-- Name: daily_challenges daily_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_pkey PRIMARY KEY (id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_pkey PRIMARY KEY (id);


--
-- Name: examination_systems examination_systems_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.examination_systems
    ADD CONSTRAINT examination_systems_code_unique UNIQUE (code);


--
-- Name: examination_systems examination_systems_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.examination_systems
    ADD CONSTRAINT examination_systems_pkey PRIMARY KEY (id);


--
-- Name: general_settings general_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.general_settings
    ADD CONSTRAINT general_settings_pkey PRIMARY KEY (id);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_unique UNIQUE (token);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: question_types question_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT question_types_code_unique UNIQUE (code);


--
-- Name: question_types question_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT question_types_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_question_answers quiz_question_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_question_answers
    ADD CONSTRAINT quiz_question_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_question_choices quiz_question_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_question_choices
    ADD CONSTRAINT quiz_question_choices_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_sessions quiz_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_pkey PRIMARY KEY (id);


--
-- Name: quiz_settings quiz_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_settings
    ADD CONSTRAINT quiz_settings_pkey PRIMARY KEY (id);


--
-- Name: quiz_types quiz_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_types
    ADD CONSTRAINT quiz_types_code_unique UNIQUE (code);


--
-- Name: quiz_types quiz_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_types
    ADD CONSTRAINT quiz_types_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: subjects subjects_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_unique UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_unique UNIQUE (code);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: terms terms_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: trophies trophies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trophies
    ADD CONSTRAINT trophies_pkey PRIMARY KEY (id);


--
-- Name: user_answers user_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_unique UNIQUE (user_id, badge_id);


--
-- Name: user_challenge_progress user_challenge_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT user_challenge_progress_pkey PRIMARY KEY (id);


--
-- Name: user_challenges user_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_pkey PRIMARY KEY (id);


--
-- Name: user_preference_changes user_preference_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preference_changes
    ADD CONSTRAINT user_preference_changes_pkey PRIMARY KEY (id);


--
-- Name: user_spark_boost user_spark_boost_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_spark_boost
    ADD CONSTRAINT user_spark_boost_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_trophies user_trophies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_trophies
    ADD CONSTRAINT user_trophies_pkey PRIMARY KEY (id);


--
-- Name: user_trophies user_trophies_user_id_trophy_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_trophies
    ADD CONSTRAINT user_trophies_user_id_trophy_id_unique UNIQUE (user_id, trophy_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_admin_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_admin_session_expire" ON public.admin_sessions USING btree (expire);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: badges badges_badge_type_id_badge_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_badge_type_id_badge_types_id_fk FOREIGN KEY (badge_type_id) REFERENCES public.badge_types(id);


--
-- Name: challenges challenges_badge_id_badges_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_badge_id_badges_id_fk FOREIGN KEY (badge_id) REFERENCES public.badges(id);


--
-- Name: credit_transactions credit_transactions_payment_transaction_id_payment_transactions; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_payment_transaction_id_payment_transactions FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id);


--
-- Name: credit_transactions credit_transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_examination_system_id_examination_system; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_examination_system_id_examination_system FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_level_id_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_level_id_levels_id_fk FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_profile_id_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_quiz_id_quizzes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_quiz_id_quizzes_id_fk FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: enhanced_quiz_sessions enhanced_quiz_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enhanced_quiz_sessions
    ADD CONSTRAINT enhanced_quiz_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: levels levels_examination_system_id_examination_systems_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_examination_system_id_examination_systems_id_fk FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: payment_transactions payment_transactions_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_plan_id_subscription_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: payment_transactions payment_transactions_subscription_id_user_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_subscription_id_user_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id);


--
-- Name: payment_transactions payment_transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: profiles profiles_examination_system_id_examination_systems_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_examination_system_id_examination_systems_id_fk FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: profiles profiles_level_id_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_level_id_levels_id_fk FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: profiles profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: questions questions_topic_id_topics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_topics_id_fk FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: quiz_question_answers quiz_question_answers_quiz_session_id_enhanced_quiz_sessions_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_question_answers
    ADD CONSTRAINT quiz_question_answers_quiz_session_id_enhanced_quiz_sessions_id FOREIGN KEY (quiz_session_id) REFERENCES public.enhanced_quiz_sessions(id);


--
-- Name: quiz_question_choices quiz_question_choices_quiz_question_id_quiz_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_question_choices
    ADD CONSTRAINT quiz_question_choices_quiz_question_id_quiz_questions_id_fk FOREIGN KEY (quiz_question_id) REFERENCES public.quiz_questions(id);


--
-- Name: quiz_questions quiz_questions_question_type_id_question_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_question_type_id_question_types_id_fk FOREIGN KEY (question_type_id) REFERENCES public.question_types(id);


--
-- Name: quiz_questions quiz_questions_quiz_id_quizzes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_quizzes_id_fk FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: quiz_sessions quiz_sessions_profile_id_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: quiz_sessions quiz_sessions_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: quiz_sessions quiz_sessions_term_id_terms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_term_id_terms_id_fk FOREIGN KEY (term_id) REFERENCES public.terms(id);


--
-- Name: quiz_sessions quiz_sessions_topic_id_topics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_topic_id_topics_id_fk FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: quiz_sessions quiz_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_sessions
    ADD CONSTRAINT quiz_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quizzes quizzes_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: quizzes quizzes_examination_system_id_examination_systems_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_examination_system_id_examination_systems_id_fk FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: quizzes quizzes_level_id_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_level_id_levels_id_fk FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: quizzes quizzes_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: quizzes quizzes_term_id_terms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_term_id_terms_id_fk FOREIGN KEY (term_id) REFERENCES public.terms(id);


--
-- Name: quizzes quizzes_topic_id_topics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_topic_id_topics_id_fk FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: subjects subjects_examination_system_id_examination_systems_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_examination_system_id_examination_systems_id_fk FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: terms terms_examination_system_id_examination_systems_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_examination_system_id_examination_systems_id_fk FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: topics topics_examination_system_id_examination_systems_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_examination_system_id_examination_systems_id_fk FOREIGN KEY (examination_system_id) REFERENCES public.examination_systems(id);


--
-- Name: topics topics_level_id_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_level_id_levels_id_fk FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: topics topics_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: topics topics_term_id_terms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_term_id_terms_id_fk FOREIGN KEY (term_id) REFERENCES public.terms(id);


--
-- Name: user_answers user_answers_quiz_session_id_quiz_sessions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_answers
    ADD CONSTRAINT user_answers_quiz_session_id_quiz_sessions_id_fk FOREIGN KEY (quiz_session_id) REFERENCES public.quiz_sessions(id);


--
-- Name: user_badges user_badges_badge_id_badges_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_badges_id_fk FOREIGN KEY (badge_id) REFERENCES public.badges(id);


--
-- Name: user_badges user_badges_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_challenge_progress user_challenge_progress_challenge_id_daily_challenges_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT user_challenge_progress_challenge_id_daily_challenges_id_fk FOREIGN KEY (challenge_id) REFERENCES public.daily_challenges(id);


--
-- Name: user_challenge_progress user_challenge_progress_profile_id_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_challenge_progress
    ADD CONSTRAINT user_challenge_progress_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: user_challenges user_challenges_challenge_id_challenges_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_challenge_id_challenges_id_fk FOREIGN KEY (challenge_id) REFERENCES public.challenges(id);


--
-- Name: user_challenges user_challenges_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_preference_changes user_preference_changes_profile_id_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preference_changes
    ADD CONSTRAINT user_preference_changes_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: user_preference_changes user_preference_changes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preference_changes
    ADD CONSTRAINT user_preference_changes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_spark_boost user_spark_boost_from_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_spark_boost
    ADD CONSTRAINT user_spark_boost_from_user_id_users_id_fk FOREIGN KEY (from_user_id) REFERENCES public.users(id);


--
-- Name: user_spark_boost user_spark_boost_to_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_spark_boost
    ADD CONSTRAINT user_spark_boost_to_user_id_users_id_fk FOREIGN KEY (to_user_id) REFERENCES public.users(id);


--
-- Name: user_subscriptions user_subscriptions_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_subscription_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: user_subscriptions user_subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_trophies user_trophies_trophy_id_trophies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_trophies
    ADD CONSTRAINT user_trophies_trophy_id_trophies_id_fk FOREIGN KEY (trophy_id) REFERENCES public.trophies(id);


--
-- Name: user_trophies user_trophies_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_trophies
    ADD CONSTRAINT user_trophies_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

