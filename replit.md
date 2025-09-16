# Daily Sparks - AI Revision Platform

## Overview

Daily Sparks is an AI-powered revision platform specifically designed for Kenyan students preparing for KCSE, IGCSE, and KPSEA examinations. The platform follows a "TikTok Simple, Harvard Smart" philosophy - providing a dead simple user interface backed by sophisticated AI algorithms for personalized learning.

The application offers gamified quiz experiences where students can take random quizzes, topical quizzes, or term-specific quizzes. The AI engine analyzes user performance to optimize question difficulty, schedule reviews, and provide personalized explanations. Students earn "sparks" (points) and maintain learning streaks to encourage consistent study habits.

**Recent Updates (September 16, 2025):**
- **Replit Environment Setup:** Successfully configured the application to run in Replit environment
- **Database Provisioning:** Created and configured PostgreSQL database with complete schema deployment
- **Data Seeding:** Successfully seeded database with 811 records including examination systems, levels, subjects, topics, questions, and users
- **Build System Fix:** Fixed tsx dependency issues by updating package.json scripts to use npx tsx
- **Frontend Configuration:** Confirmed proper Replit proxy configuration with allowedHosts: true and 0.0.0.0:5000 binding
- **Authentication Flow:** Verified form-based authentication system works correctly with session management
- **Development Workflow:** Established working development environment with automatic restarts on port 5000

## User Preferences

Preferred communication style: Simple, everyday language.
Landing page design: SaaS-friendly landing page with "Start Your Journey" CTA prominent in hero section.
Onboarding design: Examination systems as buttons in a grid, when selected shows levels as buttons underneath. Clean, button-based interface preferred over dropdowns.
Layout preferences: Sidebar navigation should only appear on the dashboard page, not on other pages like Quiz, Leaderboard, or Profile.
Top navigation design: Consistent navbar across all pages with Daily Sparks logo on left, "Start A Quiz" and "Leaderboard" buttons in center, stats (position, sparks, streak) with icons and user avatar dropdown on right. No greeting text for cleaner design.
Gamification layout: Badges and trophies should appear below leaderboard rankings as compact rows, not separate sections. Challenges should appear below dashboard stats, not above subjects.

## System Architecture

### Frontend Architecture
The frontend is built as a React Single Page Application (SPA) using modern web technologies:
- **React 18** with TypeScript for type safety and maintainable code
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and API synchronization
- **Tailwind CSS** with shadcn/ui components for consistent, mobile-first design
- **Vite** as the build tool for fast development and optimized production builds

The UI follows a mobile-first approach with three simple navigation choices to minimize cognitive load. Components are organized using the shadcn/ui pattern with reusable UI primitives in the `components/ui` directory.

### Backend Architecture
The backend follows a RESTful API design using Node.js and Express:
- **Express.js** server with TypeScript for the API layer
- **Modular route organization** with separate authentication, quiz, and data management endpoints
- **Session-based authentication** using form-based signup/signin with bcrypt password hashing
- **Middleware pattern** for request logging, error handling, and authentication checks
- **Storage abstraction layer** that separates business logic from database operations
- **Enhanced Quiz Engine** implementing LMS best practices with question snapshots and session management

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Drizzle ORM** provides compile-time type safety and excellent TypeScript integration
- **Neon serverless PostgreSQL** for cloud-hosted database with connection pooling
- **Enhanced quiz schema** following Tutor LMS/LearnDash best practices
- **Question snapshots** using JSONB for session integrity
- **Migration system** using Drizzle Kit for schema version control

Key entities include:
- Users with onboarding status, exam type, form level, and gamification metrics
- Hierarchical content structure (subjects → topics → questions)
- **Enhanced quiz system** with proper question snapshots, multiple quiz types, and comprehensive analytics
- Quiz sessions with detailed answer tracking and performance analytics
- Daily challenges and user progress tracking
- **Quiz workflow engine** supporting Random, Topical, and Termly quiz generation

### Authentication System
Authentication is handled through a secure form-based system:
- **Form-based signup/signin** with email and password validation
- **bcrypt password hashing** with 12 salt rounds for security
- **Express sessions** with PostgreSQL session store for persistence
- **Route-level protection** using authentication middleware
- **User profile management** with automatic account creation and email verification support

### State Management
Client-side state is managed using a combination of approaches:
- **TanStack Query** for server state, API caching, and background synchronization
- **React hooks** for local component state
- **URL state** via Wouter for navigation and deep linking
- **Session storage** for authentication state persistence

### Development Workflow
The application supports both development and production environments:
- **Development mode** with Vite dev server, HMR, and API proxy
- **Production build** creates optimized static assets and Node.js server bundle
- **TypeScript compilation** with strict type checking across frontend, backend, and shared code
- **Shared schema** types between frontend and backend for API contract safety

### Mobile Optimization
The platform is designed with mobile-first principles:
- **Responsive design** using Tailwind's mobile-first breakpoints
- **Touch-friendly interface** with appropriate button sizes and spacing
- **Bottom navigation** pattern common in mobile apps
- **PWA-ready** structure for potential mobile app deployment

### Performance Considerations
Several optimization strategies are implemented:
- **Code splitting** through Vite's automatic chunking
- **Query caching** with TanStack Query for reduced API calls
- **Database connection pooling** via Neon serverless
- **Optimized bundle sizes** through tree shaking and modern JavaScript output