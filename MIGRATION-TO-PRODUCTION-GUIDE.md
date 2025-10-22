# 🚀 Production Database Migration Guide

## Overview

This guide explains how to migrate your AI-generated content (topics, notes, quizzes) from **development** to **production** database in Replit.

**Important:** Replit does NOT automatically migrate data when you deploy. Only schema changes are synced.

---

## 📊 What You're Migrating

- ✅ **47 topics** with AI-generated study notes
  - Mathematics: 29 topics
  - Computer Studies: 17 topics  
  - Music: 1 topic
- ✅ All examination systems, levels, and subjects
- ✅ All questions and quizzes

---

## 🎯 Migration Methods

### **Method 1: Using Migration Scripts** (Recommended)

This is the **safest** and **easiest** method. It preserves your data integrity and handles conflicts automatically.

#### **Step 1: Export Development Data**

In your Replit workspace shell, run:

```bash
npx tsx export-development-data.ts
```

This creates a file like `database-export-1234567890.json` with all your data.

**Expected output:**
```
📦 Exporting Development Database Data
=============================================================

📋 Fetching examination systems...
   ✅ 3 examination systems
📋 Fetching levels...
   ✅ 12 levels
📋 Fetching subjects...
   ✅ 10 subjects
📋 Fetching topics...
   ✅ 239 topics
📋 Fetching questions...
   ✅ 91 questions
📋 Fetching quizzes...
   ✅ 8 quizzes

=============================================================
✅ Export Complete!
=============================================================
📁 File: database-export-1234567890.json
📊 Total records: 363
=============================================================
```

#### **Step 2: Get Production Database Credentials**

1. In your Replit workspace, open the **Database** tool (left sidebar)
2. Click on **Production database** tab
3. Click **Settings** or **Connection info**
4. Copy the **DATABASE_URL** (connection string)

It looks like:
```
postgresql://user:password@host:5432/database?sslmode=require
```

#### **Step 3: Import to Production**

Run the import script with your production credentials:

```bash
PRODUCTION_DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require" \
npx tsx import-to-production.ts database-export-1234567890.json
```

Replace:
- `database-export-1234567890.json` with your actual export filename
- The DATABASE_URL with your actual production URL

**Expected output:**
```
📥 Importing Data to Production Database
=============================================================

🔌 Connecting to production database...
✅ Connected!

📖 Reading database-export-1234567890.json...
📅 Export date: 2025-01-20T...
📊 Summary:
   - examinationSystems: 3
   - levels: 12
   - subjects: 10
   - topics: 239
   - questions: 91
   - quizzes: 8

🚀 Starting import...

📝 Importing examination systems...
   ✅ 3 examination systems

📝 Importing levels...
   ✅ 12 levels

📝 Importing subjects...
   ✅ 10 subjects

📝 Importing topics (including AI-generated notes)...
   ✅ 239 topics

📝 Importing questions...
   ✅ 91 questions

📝 Importing quizzes...
   ✅ 8 quizzes

=============================================================
✅ Import Complete!
=============================================================

🎉 All data successfully imported to production database!
```

---

### **Method 2: Using PostgreSQL pg_dump** (Advanced)

For advanced users who prefer standard PostgreSQL tools.

#### **Step 1: Export from Development**

```bash
# Get development database credentials
echo $DATABASE_URL

# Export data only (no schema)
pg_dump $DATABASE_URL \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  -f development-data.sql
```

#### **Step 2: Import to Production**

```bash
# Import to production
psql <PRODUCTION_DATABASE_URL> -f development-data.sql
```

---

### **Method 3: Manual Copy via Replit UI** (Small Changes Only)

For small data updates:

1. Open **Database** tool
2. Switch to **Production database** tab  
3. Go to **My data**
4. Toggle **Edit** mode
5. Manually copy/paste records

⚠️ **Not recommended** for 239 topics - too time-consuming and error-prone.

---

## ✅ Verify Migration

After migration, verify your data in production:

### **Option 1: Via Replit Database UI**

1. Open Database tool
2. Switch to **Production database**
3. Click **My data**
4. Check tables: `topics`, `subjects`, `questions`, etc.

### **Option 2: Via SQL Query**

Connect to production and run:

```sql
-- Check topics with content
SELECT 
  s.name as subject,
  COUNT(*) as total_topics,
  SUM(CASE WHEN t.summary_content IS NOT NULL THEN 1 ELSE 0 END) as with_notes
FROM topics t
JOIN subjects s ON t.subject_id = s.id
GROUP BY s.name
ORDER BY with_notes DESC;
```

Expected result:
```
subject            | total_topics | with_notes
-------------------|--------------|-----------
Mathematics        | 29           | 29
Computer Studies   | 17           | 17
Music              | 15           | 1
```

---

## 🔄 Update Production After Future Content Generation

When you generate more content (e.g., Chemistry, Biology, Physics):

1. **Export again:**
   ```bash
   npx tsx export-development-data.ts
   ```

2. **Import to production:**
   ```bash
   PRODUCTION_DATABASE_URL="..." npx tsx import-to-production.ts database-export-<new>.json
   ```

The script uses `onConflictDoUpdate`, so:
- ✅ Existing records are **updated** (safe)
- ✅ New records are **inserted**
- ✅ No duplicates created

---

## ⚠️ Important Considerations

### **Data Safety**

- ✅ **Backup first:** Export production data before importing
- ✅ **Test in dev:** Verify export/import in development first
- ✅ **Schema sync:** Ensure production schema matches development

### **During Import**

- ⏱️ **Downtime:** Brief interruption (~30 seconds for 239 topics)
- 🔒 **Lock:** Database may be locked during import
- 📊 **Monitor:** Watch console output for errors

### **After Import**

- ✅ **Verify data:** Check topic counts match
- ✅ **Test app:** Visit production app and verify Study Notes page works
- ✅ **Check integrity:** Ensure relationships (topics → subjects → levels) are intact

---

## 🆘 Troubleshooting

### **Error: Connection refused**

- Check production DATABASE_URL is correct
- Ensure production database is running
- Verify SSL mode is set (`?sslmode=require`)

### **Error: Duplicate key violation**

- Normal if re-running import
- Script uses `onConflictDoUpdate` to handle this
- Data will be updated, not duplicated

### **Error: Foreign key violation**

- Import order matters (examination systems → levels → subjects → topics)
- Script handles this automatically
- If manual import, follow correct order

### **Import seems slow**

- Normal for large datasets (239 topics)
- Each record is inserted individually for safety
- Expect ~30-60 seconds for full import

---

## 📋 Quick Reference

### **Export Command**
```bash
npx tsx export-development-data.ts
```

### **Import Command**
```bash
PRODUCTION_DATABASE_URL="your-prod-url" \
npx tsx import-to-production.ts database-export-123456.json
```

### **Check Status**
```bash
npx tsx check-content-status.ts
```

---

## 🎉 Success Checklist

After migration, you should have:

- ✅ All 239 topics in production database
- ✅ 47 topics with AI-generated study notes visible
- ✅ Study Notes page working in production app
- ✅ All examination systems, levels, subjects present
- ✅ Questions and quizzes migrated

---

## 📞 Need Help?

If you encounter issues:

1. Check the console output for specific error messages
2. Verify database credentials are correct
3. Ensure development and production schemas match
4. Try exporting again if export file is corrupted
5. Check Replit docs: https://docs.replit.com/cloud-services/storage-and-databases/production-databases

---

**Created:** January 2025  
**Scripts:** `export-development-data.ts`, `import-to-production.ts`  
**Status:** Ready to use
