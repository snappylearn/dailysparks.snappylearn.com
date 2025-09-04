import * as bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { SignupData, SigninData, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
    disableTouch: true,
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Setup session middleware
export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create new user
export async function createUser(userData: SignupData) {
  const hashedPassword = await hashPassword(userData.password);
  
  const [newUser] = await db
    .insert(users)
    .values({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
    })
    .returning();
    
  return newUser;
}

// Authenticate user
export async function authenticateUser(credentials: SigninData) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);
    
  if (!user || !user.isActive) {
    return null;
  }
  
  if (!user.password) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(credentials.password, user.password);
  if (!isValidPassword) {
    return null;
  }
  
  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));
    
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

// Setup password for existing user
export async function setupUserPassword(userId: string, password: string) {
  const hashedPassword = await hashPassword(password);
  
  const [updatedUser] = await db
    .update(users)
    .set({ 
      password: hashedPassword, 
      needsPasswordSetup: false,
      lastLoginAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();
    
  return {
    id: updatedUser.id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
  };
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Get current user from session
export function getCurrentUser(req: any) {
  return (req.session as any)?.user || null;
}