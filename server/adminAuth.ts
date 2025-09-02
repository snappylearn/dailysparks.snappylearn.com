import { Express, RequestHandler } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { AdminUser, insertAdminUserSchema } from "@shared/schema";
import { z } from "zod";
import connectPgSimple from "connect-pg-simple";
import { db, pool } from "./db";

const scryptAsync = promisify(scrypt);

// Extend Express Request to include admin session
declare global {
  namespace Express {
    interface Request {
      adminSession?: {
        adminId?: string;
        isAdminAuthenticated?: boolean;
      };
    }
  }
}

// Password hashing utilities
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    return false;
  }
}

// Admin session store configuration
const PostgresSessionStore = connectPgSimple(session);

const adminSessionStore = new PostgresSessionStore({
  pool: pool,
  tableName: "admin_sessions",
  createTableIfMissing: true,
});

// Login schema validation
const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function setupAdminAuth(app: Express) {
  // Admin session middleware - separate from regular user sessions
  app.use('/admin', session({
    name: 'admin.sid', // Different session name from regular users
    secret: process.env.SESSION_SECRET || 'admin-secret-key',
    store: adminSessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Admin login route
  app.post("/admin/api/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      
      const adminUser = await storage.getAdminByEmail(email);
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePasswords(password, adminUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateAdminLastLogin(adminUser.id);

      // Set admin session
      req.adminSession = {
        adminId: adminUser.id,
        isAdminAuthenticated: true,
      };

      // Return admin user without password
      const { password: _, ...adminUserWithoutPassword } = adminUser;
      res.json(adminUserWithoutPassword);
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout route
  app.post("/admin/api/logout", (req, res) => {
    req.adminSession = undefined;
    req.session.destroy((err) => {
      if (err) {
        console.error("Admin logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('admin.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current admin user
  app.get("/admin/api/user", isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = req.adminSession?.adminId;
      if (!adminId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const adminUser = await storage.getAdmin(adminId);
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ message: "Admin not found or inactive" });
      }

      const { password: _, ...adminUserWithoutPassword } = adminUser;
      res.json(adminUserWithoutPassword);
    } catch (error) {
      console.error("Error fetching admin user:", error);
      res.status(500).json({ message: "Failed to fetch admin user" });
    }
  });

  // Create admin user route (for initial setup - should be protected in production)
  app.post("/admin/api/create", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role = "admin" } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin user already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const adminUser = await storage.createAdmin({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });

      const { password: _, ...adminUserWithoutPassword } = adminUser;
      res.status(201).json(adminUserWithoutPassword);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });
}

// Admin authentication middleware
export const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (req.adminSession?.isAdminAuthenticated && req.adminSession?.adminId) {
    return next();
  }
  
  return res.status(401).json({ message: "Admin authentication required" });
};

// Utility functions for password operations (export for potential use in scripts)
export { hashPassword, comparePasswords };