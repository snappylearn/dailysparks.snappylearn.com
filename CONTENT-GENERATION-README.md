# 📚 KCSE Content Generation Scripts

This folder contains AI-powered content generation scripts for all 8-4-4 KCSE subjects (Forms 1-4).

## 🎯 Available Scripts

Each script generates comprehensive study notes for all topics in a specific subject using OpenAI's GPT-4 model.

| Script | Subject | Icon | Estimated Topics |
|--------|---------|------|------------------|
| `generate-chemistry-notes.ts` | Chemistry | 🧪 | ~23 topics |
| `generate-biology-notes.ts` | Biology | 🧬 | ~23 topics |
| `generate-physics-notes.ts` | Physics | ⚡ | ~41 topics |
| `generate-history-notes.ts` | History & Government | 📜 | ~27 topics |
| `generate-business-notes.ts` | Business Studies | 💼 | ~27 topics |
| `generate-computer-notes.ts` | Computer Studies | 💻 | ~17 topics |
| `generate-agriculture-notes.ts` | Agriculture | 🌾 | ~17 topics |
| `generate-homescience-notes.ts` | Home Science | 🏠 | ~20 topics |
| `generate-music-notes.ts` | Music | 🎵 | ~15 topics |

**✅ Already Complete:** Mathematics (29/29 topics)

## 🚀 How to Use

### Single Subject Generation

To generate content for a specific subject, run:

```bash
npx tsx generate-chemistry-notes.ts
```

Or for any other subject:

```bash
npx tsx generate-biology-notes.ts
npx tsx generate-physics-notes.ts
npx tsx generate-history-notes.ts
npx tsx generate-business-notes.ts
npx tsx generate-computer-notes.ts
npx tsx generate-agriculture-notes.ts
npx tsx generate-homescience-notes.ts
npx tsx generate-music-notes.ts
```

### Batch Generation (All Subjects)

To generate content for multiple subjects sequentially:

```bash
# Science subjects
npx tsx generate-chemistry-notes.ts && \
npx tsx generate-biology-notes.ts && \
npx tsx generate-physics-notes.ts

# Humanities
npx tsx generate-history-notes.ts && \
npx tsx generate-business-notes.ts

# Technical subjects
npx tsx generate-computer-notes.ts && \
npx tsx generate-agriculture-notes.ts

# Optional subjects
npx tsx generate-homescience-notes.ts && \
npx tsx generate-music-notes.ts
```

## ⚙️ Script Features

Each script automatically:

1. ✅ **Checks existing content** - Skips topics that already have notes
2. 📊 **Orders by level** - Generates Form 1 → Form 2 → Form 3 → Form 4
3. 🤖 **Uses OpenAI GPT-4** - Generates comprehensive study notes with LaTeX math support
4. ⏳ **Rate limiting** - 3-second delay between API calls to avoid rate limits
5. 📈 **Progress tracking** - Real-time console updates showing completion status
6. 💾 **Auto-saves** - Updates database immediately after each topic
7. 🛡️ **Error handling** - Continues on failures, reports summary at end

## 📊 Content Format

Generated content includes:

- **Comprehensive explanations** of key concepts
- **LaTeX-formatted equations** (for science/math subjects)
- **Examples and applications**
- **Key terminology and definitions**
- **Study tips and common misconceptions**
- **Real-world connections** (where applicable)

## ⚠️ Important Notes

### Rate Limits

- Scripts include 3-second delays between API calls
- For large subjects (e.g., Physics with 41 topics), the script may take 2+ hours
- Scripts may timeout after 10 minutes - simply re-run to continue where it left off

### OpenAI API Key

Ensure `OPENAI_API_KEY` is set in your Replit Secrets:
- Go to Tools → Secrets
- Add key: `OPENAI_API_KEY`
- Add your OpenAI API key as the value

### Database Requirements

- PostgreSQL database must be running
- Tables: `topics`, `subjects`, `levels` must exist
- Topics must be pre-seeded with metadata (title, description, subject_id, level_id)

## 📈 Tracking Progress

To check content generation progress for any subject:

```sql
SELECT 
  l.title as form,
  COUNT(*) as total_topics,
  SUM(CASE WHEN t.summary_content IS NOT NULL AND LENGTH(t.summary_content) > 100 THEN 1 ELSE 0 END) as complete
FROM topics t
JOIN levels l ON t.level_id = l.id
JOIN subjects s ON t.subject_id = s.id
WHERE s.name = 'Chemistry'  -- Change subject name here
GROUP BY l.title, l.order
ORDER BY l.order;
```

Or check all subjects at once:

```sql
SELECT 
  s.name as subject,
  COUNT(*) as total,
  SUM(CASE WHEN t.summary_content IS NOT NULL AND LENGTH(t.summary_content) > 100 THEN 1 ELSE 0 END) as complete,
  ROUND(100.0 * SUM(CASE WHEN t.summary_content IS NOT NULL AND LENGTH(t.summary_content) > 100 THEN 1 ELSE 0 END) / COUNT(*), 1) as percent_complete
FROM topics t
JOIN subjects s ON t.subject_id = s.id
GROUP BY s.name
ORDER BY complete DESC;
```

## 🎯 Recommended Generation Order

For efficient content generation, prioritize based on subject importance:

### Priority 1: Core Sciences (High Demand)
```bash
npx tsx generate-chemistry-notes.ts
npx tsx generate-biology-notes.ts  
npx tsx generate-physics-notes.ts
```

### Priority 2: Humanities & Social Sciences
```bash
npx tsx generate-history-notes.ts
npx tsx generate-business-notes.ts
```

### Priority 3: Technical & Optional Subjects
```bash
npx tsx generate-computer-notes.ts
npx tsx generate-agriculture-notes.ts
npx tsx generate-homescience-notes.ts
npx tsx generate-music-notes.ts
```

## 💡 Tips for Success

1. **Start with smaller subjects** (Music, Computer Studies) to test the system
2. **Monitor the first few topics** to ensure quality meets expectations
3. **Run during off-peak hours** to minimize API latency
4. **Check console output** for any API errors or failures
5. **Re-run scripts** if timeout occurs - they skip completed topics automatically

## 🔧 Troubleshooting

### Script Timeouts
**Problem:** Script times out after 10 minutes  
**Solution:** Simply re-run the same script - it will skip completed topics

### API Rate Limits
**Problem:** OpenAI API rate limit errors  
**Solution:** Increase delay in script from 3000ms to 5000ms

### Missing Topics
**Problem:** Some topics not being processed  
**Solution:** Check that topics exist in database with valid subject_id and level_id

### Content Quality Issues
**Problem:** Generated content doesn't meet quality standards  
**Solution:** Adjust the prompt in `server/aiService.ts` → `generateTopicContent()`

## 📞 Support

For issues with content generation:
1. Check console logs for specific error messages
2. Verify database connection and schema
3. Confirm OpenAI API key is valid and has credits
4. Review `server/aiService.ts` for prompt customization options

---

**Last Updated:** October 21, 2025  
**Total Scripts:** 9 subjects (+ Mathematics already complete)  
**Total Topics to Generate:** ~210 topics across all subjects
