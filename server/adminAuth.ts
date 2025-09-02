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

// Login schema validation
const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function setupAdminAuth(app: Express) {
  // Use the existing session middleware - no need for separate admin sessions

  // Admin login route
  app.post("/admin/api/login", async (req, res) => {
    try {
      console.log("Admin login attempt:", req.body.email);
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

      // Set admin session using the Express session
      (req.session as any).adminId = adminUser.id;
      (req.session as any).isAdminAuthenticated = true;

      console.log("Session set:", { adminId: adminUser.id, sessionId: req.sessionID });

      // Save the session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }
        
        console.log("Session saved successfully");
        // Return admin user without password
        const { password: _, ...adminUserWithoutPassword } = adminUser;
        res.json(adminUserWithoutPassword);
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout route
  app.post("/admin/api/logout", (req, res) => {
    (req.session as any).adminId = undefined;
    (req.session as any).isAdminAuthenticated = false;
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
      const adminId = (req.session as any).adminId;
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
  const session = req.session as any;
  console.log("Admin auth check:", { 
    sessionID: req.sessionID, 
    isAdminAuthenticated: session.isAdminAuthenticated, 
    adminId: session.adminId 
  });
  
  if (session.isAdminAuthenticated && session.adminId) {
    return next();
  }
  
  return res.status(401).json({ message: "Admin authentication required" });
};

// Utility functions for password operations (export for potential use in scripts)
export { hashPassword, comparePasswords };