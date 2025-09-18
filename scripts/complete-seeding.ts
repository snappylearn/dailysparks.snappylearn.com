import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Read the full seed file and execute in chunks
async function completeSeedingProcess() {
  console.log('Completing database seeding...');
  
  const seedFilePath = 'scripts/seed_core.sql';
  const seedContent = fs.readFileSync(seedFilePath, 'utf-8');
  
  // Extract all INSERT statements after the foundational tables
  const lines = seedContent.split('\n');
  const statements: string[] = [];
  let currentStatement = '';
  let inInsert = false;
  
  for (const line of lines) {
    // Skip already processed tables (examination_systems, levels, subjects, terms we just did)
    if (line.includes('-- Seeding examination_systems') ||
        line.includes('-- Seeding levels') ||
        line.includes('-- Seeding subjects')) {
      continue;
    }
    
    // Look for terms section - we need to continue from where we left off
    if (line.includes('-- Seeding terms')) {
      inInsert = false; // Skip the first terms we already did
      continue;
    }
    
    // Start collecting after terms or from topics onward
    if (line.includes('-- Seeding topics') ||
        line.includes('-- Seeding questions') ||
        line.includes('-- Seeding admin_users') ||
        line.includes('-- Seeding users') ||
        line.includes('-- Seeding profiles') ||
        line.includes('-- Seeding badge_types') ||
        line.includes('-- Seeding badges') ||
        line.includes('-- Seeding challenges') ||
        line.includes('-- Seeding trophies') ||
        line.includes('-- Seeding quiz_sessions')) {
      inInsert = true;
      currentStatement = '';
    }
    
    if (inInsert) {
      if (line.startsWith('INSERT INTO') || line.startsWith('  (') || line.includes('ON CONFLICT DO NOTHING')) {
        currentStatement += line + '\\n';
        
        // If statement ends, add it to statements array
        if (line.includes('ON CONFLICT DO NOTHING;')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      } else if (line.startsWith('-- Seeding') && currentStatement) {
        // New section started, save previous statement
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
  }
  
  // Add final statement if exists
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  console.log(`Found ${statements.length} statements to execute`);
  
  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement && statement.includes('INSERT INTO')) {
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const result = await sql(statement);
        console.log(`✓ Statement ${i + 1} completed`);
      } catch (error) {
        console.error(`✗ Error in statement ${i + 1}:`, error);
        console.log('Statement:', statement.substring(0, 200) + '...');
      }
    }
  }
  
  // Verify data counts
  console.log('\\nVerifying data counts:');
  const tables = [
    'examination_systems', 'levels', 'subjects', 'terms', 'topics', 
    'questions', 'admin_users', 'users', 'profiles', 'badge_types',
    'badges', 'challenges', 'trophies', 'quiz_sessions'
  ];
  
  for (const table of tables) {
    try {
      const count = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
      console.log(`${table}: ${count[0].count} records`);
    } catch (error) {
      console.log(`${table}: Error counting - ${error.message}`);
    }
  }
  
  console.log('\\nSeeding completed!');
}

completeSeedingProcess().catch(console.error);