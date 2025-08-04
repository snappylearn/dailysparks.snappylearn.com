# Daily Sparks - AI Revision Platform

## Overview

Daily Sparks is an AI-powered revision platform specifically designed for Kenyan students preparing for KCSE, IGCSE, and KPSEA examinations. The platform follows a "TikTok Simple, Harvard Smart" philosophy - providing a dead simple user interface backed by sophisticated AI algorithms for personalized learning.

The application offers gamified quiz experiences where students can take random quizzes, topical quizzes, or term-specific quizzes. The AI engine analyzes user performance to optimize question difficulty, schedule reviews, and provide personalized explanations. Students earn "sparks" (points) and maintain learning streaks to encourage consistent study habits.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Session-based authentication** integrated with Replit's OIDC system
- **Middleware pattern** for request logging, error handling, and authentication checks
- **Storage abstraction layer** that separates business logic from database operations

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Drizzle ORM** provides compile-time type safety and excellent TypeScript integration
- **Neon serverless PostgreSQL** for cloud-hosted database with connection pooling
- **Relational schema** supporting users, subjects, topics, questions, quiz sessions, and user progress tracking
- **Session storage** table for Express session management
- **Migration system** using Drizzle Kit for schema version control

Key entities include:
- Users with onboarding status, exam type, form level, and gamification metrics
- Hierarchical content structure (subjects → topics → questions)
- Quiz sessions with detailed answer tracking and performance analytics
- Daily challenges and user progress tracking

### Authentication System
Authentication is handled through Replit's integrated OIDC system:
- **OpenID Connect (OIDC)** integration with Replit's authentication service
- **Passport.js** strategy for handling OAuth flows
- **Express sessions** with PostgreSQL session store for persistence
- **Route-level protection** using authentication middleware
- **User profile management** with automatic account creation on first login

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