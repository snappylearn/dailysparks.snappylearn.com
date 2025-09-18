import fs from 'fs';
import path from 'path';

// Define the target tables and their dependency order
const targetTables = new Set([
  'examination_systems',
  'levels', 
  'subjects',
  'terms',
  'topics',
  'questions',
  'admin_users',
  'users',
  'profiles',
  'badge_types',
  'badges',
  'challenges',
  'trophies',
  'quiz_sessions'
]);

// Dependency-safe order for imports
const tableOrder = [
  'examination_systems',
  'levels',
  'subjects', 
  'terms',
  'topics',
  'questions',
  'admin_users',
  'users',
  'profiles',
  'badge_types',
  'badges',
  'challenges',
  'trophies',
  'quiz_sessions'
];

async function extractSeedData() {
  console.log('Extracting seed data from database export...');
  
  const exportFilePath = path.resolve(process.cwd(), 'attached_assets/database_export_1758028503031.sql');
  const seedFilePath = path.resolve(process.cwd(), 'scripts/seed_core.sql');
  
  if (!fs.existsSync(exportFilePath)) {
    throw new Error(`Export file not found: ${exportFilePath}`);
  }
  
  const fileContent = fs.readFileSync(exportFilePath, 'utf-8');
  const lines = fileContent.split('\n');
  
  const tableInserts: Record<string, string[]> = {};
  let currentTable: string | null = null;
  let currentInsert: string[] = [];
  let inInsertBlock = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line starts an INSERT INTO statement for a target table
    const insertMatch = trimmedLine.match(/^INSERT INTO "([^"]+)"/);
    if (insertMatch) {
      const tableName = insertMatch[1];
      if (targetTables.has(tableName)) {
        // Save previous insert if exists
        if (currentTable && currentInsert.length > 0) {
          if (!tableInserts[currentTable]) {
            tableInserts[currentTable] = [];
          }
          tableInserts[currentTable].push(currentInsert.join('\n'));
        }
        
        currentTable = tableName;
        currentInsert = [line];
        inInsertBlock = true;
        continue;
      } else {
        // Not a target table, skip
        currentTable = null;
        currentInsert = [];
        inInsertBlock = false;
        continue;
      }
    }
    
    // If we're in an insert block for a target table
    if (inInsertBlock && currentTable) {
      currentInsert.push(line);
      
      // Check if this line ends the insert statement
      if (trimmedLine.endsWith(';') && !trimmedLine.includes('INSERT INTO')) {
        if (!tableInserts[currentTable]) {
          tableInserts[currentTable] = [];
        }
        tableInserts[currentTable].push(currentInsert.join('\n'));
        currentTable = null;
        currentInsert = [];
        inInsertBlock = false;
      }
    }
  }
  
  // Save any remaining insert
  if (currentTable && currentInsert.length > 0) {
    if (!tableInserts[currentTable]) {
      tableInserts[currentTable] = [];
    }
    tableInserts[currentTable].push(currentInsert.join('\n'));
  }
  
  // Generate the seed file in dependency order
  const seedStatements: string[] = [
    'SET session_replication_role = replica;',
    'BEGIN;',
    ''
  ];
  
  for (const tableName of tableOrder) {
    if (tableInserts[tableName]) {
      seedStatements.push(`-- Seeding ${tableName}`);
      for (let statement of tableInserts[tableName]) {
        // Add ON CONFLICT DO NOTHING to prevent duplicate key errors
        statement = statement.replace(/;\s*$/, ' ON CONFLICT DO NOTHING;');
        seedStatements.push(statement);
      }
      seedStatements.push('');
    }
  }
  
  seedStatements.push('COMMIT;');
  
  // Write the seed file
  fs.writeFileSync(seedFilePath, seedStatements.join('\n'));
  
  // Print summary
  console.log('Extraction complete!');
  console.log('Tables extracted:');
  for (const tableName of tableOrder) {
    if (tableInserts[tableName]) {
      console.log(`- ${tableName}: ${tableInserts[tableName].length} INSERT statement(s)`);
    }
  }
  
  console.log(`\nSeed file created: ${seedFilePath}`);
}

extractSeedData().catch(console.error);