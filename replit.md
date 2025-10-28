# Daily Sparks - AI Revision Platform

## Overview

Daily Sparks is an AI-powered revision platform designed for Kenyan students preparing for KCSE, IGCSE, and KPSEA examinations. It provides a simple user interface ("TikTok Simple") backed by sophisticated AI for personalized learning ("Harvard Smart"). The platform offers gamified quiz experiences (random, topical, term-specific) with an AI engine that optimizes question difficulty, schedules reviews, and provides personalized explanations. Students earn "sparks" and maintain learning streaks to encourage consistent study habits. The project aims to provide curriculum-aligned, verified content to enhance student performance.

## User Preferences

Preferred communication style: Simple, everyday language.
Landing page design: SaaS-friendly landing page with "Start Your Journey" CTA prominent in hero section.
Onboarding design: Examination systems as buttons in a grid, when selected shows levels as buttons underneath. Clean, button-based interface preferred over dropdowns.
Layout preferences: Sidebar navigation should only appear on the dashboard page, not on other pages like Quiz, Leaderboard, or Profile.
Top navigation design: Consistent navbar across all pages with Daily Sparks logo on left, "Start A Quiz" and "Leaderboard" buttons in center, stats (position, sparks, streak) with icons and user avatar dropdown on right. No greeting text for cleaner design.
Gamification layout: Badges and trophies should appear below leaderboard rankings as compact rows, not separate sections. Challenges should appear below dashboard stats, not above subjects.

## System Architecture

### Frontend Architecture
The frontend is a React 18 SPA using TypeScript. It utilizes Wouter for routing, TanStack Query for server state management, and Tailwind CSS with shadcn/ui for a mobile-first design. Vite is used for building.

### Backend Architecture
The backend is a RESTful API built with Node.js and Express.js using TypeScript. It features modular route organization, session-based authentication with bcrypt, and a middleware pattern for logging, error handling, and authentication. A storage abstraction layer separates business logic from database operations, and an enhanced quiz engine implements LMS best practices.

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe operations. Key features include Neon serverless PostgreSQL, an enhanced quiz schema with question snapshots (JSONB) for session integrity, and a migration system using Drizzle Kit. The schema includes users, hierarchical content (subjects, topics, questions), an enhanced quiz system with verification, quiz sessions, daily challenges, and user progress tracking.

### Authentication System
A secure form-based authentication system is implemented with email and password validation, bcrypt hashing (12 salt rounds), and Express sessions with a PostgreSQL store. Route-level protection is enforced via middleware.

### Email Notification System
The platform includes an email notification system (Gmail for dev, SendGrid ready for prod) using nodemailer. It sends quiz verification emails to administrators, password reset emails, and automated notifications for system events.

### Quiz Verification Workflow
A quality assurance system marks all AI-generated quizzes as `isVerified: false` by default. Email notifications are sent to administrators for review, who then use an Admin UI toggle to manage verification status. Only verified quizzes are shown to students.

### State Management
Client-side state is managed using TanStack Query for server state, React hooks for local component state, URL state via Wouter, and session storage for authentication.

### Development Workflow
Supports development (Vite dev server, HMR, API proxy) and production (optimized builds). Features TypeScript compilation and shared schema types for API contract safety.

### Mobile Optimization
Designed with mobile-first principles, responsive design using Tailwind, touch-friendly interface, and PWA-ready structure.

### Performance Considerations
Optimizations include code splitting (Vite), query caching (TanStack Query), database connection pooling (Neon), and optimized bundle sizes.

### Quiz Generation Standards
Quizzes standardize to 15 questions, supporting Random, Topical, and Term-based types with configurable time limits and difficulty levels (Easy, Medium, Hard, Mixed). AI-generated quizzes are `isVerified: false` by default, triggering email notifications for admin review.

### Challenges Auto-Completion System
Challenges automatically track progress based on sparks earned from quizzes and award rewards upon completion. The system includes duplicate prevention, automatic daily challenge resets, and UI updates to show "Auto-Tracked" progress.

## External Dependencies

- **PostgreSQL:** Primary database, hosted on Neon (serverless).
- **Drizzle ORM:** TypeScript ORM for database interactions.
- **Node.js:** Backend runtime environment.
- **Express.js:** Web application framework for the backend.
- **React 18:** Frontend library.
- **Wouter:** Lightweight client-side router.
- **TanStack Query:** Server state management.
- **Tailwind CSS:** Utility-first CSS framework.
- **shadcn/ui:** UI component library.
- **Vite:** Frontend build tool.
- **bcrypt:** Password hashing library.
- **nodemailer:** Email sending library (for Gmail in dev, SendGrid for prod).
- **SendGrid:** Email delivery service (production-ready).
- **LLM (Large Language Model):** Used for AI quiz and content generation.