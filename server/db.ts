import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon with WebSocket settings
neonConfig.webSocketConstructor = ws;
// Configure secure WebSocket settings for Neon
neonConfig.wsProxy = (host) => `${host}:443/v2`;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with connection pooling for deployment
let connectionString = process.env.DATABASE_URL;

// Enable Neon connection pooler for production/deployment
if (process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT) {
  connectionString = connectionString?.replace('.us-east-2', '-pooler.us-east-2');
}

export const pool = new Pool({ 
  connectionString,
  max: 10, // Limit concurrent connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Timeout connection attempts after 5s
});
export const db = drizzle({ client: pool, schema });