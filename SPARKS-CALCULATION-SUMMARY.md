# Sparks Calculation System - Daily Sparks

## Current System Status ✅

**Quiz Questions:** All quizzes have **15 questions** (standardized across all quiz types)

**Sparks Calculation:** Currently using **configurable database settings** (quiz_settings table)

---

## Current Sparks Formula (Active System)

### Base Calculation
```
Base Sparks = Number of Correct Answers × Sparks Per Correct Answer
```
- **Default:** 5 sparks per correct answer
- **Editable:** Yes, via Admin Panel

### Accuracy Multipliers
The base sparks are multiplied based on quiz accuracy:

| Accuracy Level | Multiplier | Example (10/15 correct) |
|----------------|------------|-------------------------|
| 80%+ (12-15 correct) | **1.5x** | 10 × 5 = 50 → **75 sparks** |
| 60-79% (9-11 correct) | **1.2x** | 10 × 5 = 50 → **60 sparks** |
| Below 60% | **1.0x** | 10 × 5 = **50 sparks** |

### Example Calculations
For a 15-question quiz with sparksPerCorrectAnswer = 5:

- **15/15 correct (100%):** 15 × 5 × 1.5 = **113 sparks** 🔥
- **12/15 correct (80%):** 12 × 5 × 1.5 = **90 sparks**
- **10/15 correct (67%):** 10 × 5 × 1.2 = **60 sparks**
- **8/15 correct (53%):** 8 × 5 × 1.0 = **40 sparks**

---

## Admin Settings Configuration ⚙️

### Location
Navigate to: **Admin Dashboard → Platform Settings → Quiz Settings Tab**

### Editable Parameters

| Setting | Current Default | Range | Description |
|---------|----------------|-------|-------------|
| **Sparks Per Correct Answer** | 5 | 1-20 | Base sparks awarded per correct answer |
| **Accuracy Bonus Threshold** | 0.80 (80%) | 0-1 | Minimum accuracy for high bonus |
| **Accuracy Bonus Multiplier** | 1.50 (1.5x) | 1-3 | Multiplier for 80%+ accuracy |
| **Good Accuracy Threshold** | 0.60 (60%) | 0-1 | Minimum accuracy for good bonus |
| **Good Accuracy Multiplier** | 1.20 (1.2x) | 1-3 | Multiplier for 60%+ accuracy |
| **Max Questions Per Quiz** | 15 | 5-50 | Maximum questions allowed |
| **Min Questions Per Quiz** | 5 | 1-15 | Minimum questions allowed |
| **Time Per Question (seconds)** | 45 | 10-300 | Default time limit per question |

### How to Edit Settings
1. Log in to Admin Dashboard at `/admin-login`
2. Navigate to **Platform Settings**
3. Click on **Quiz Settings** tab
4. Modify the desired values
5. Click **Save Quiz Settings**
6. Changes take effect immediately for new quizzes

---

## Database Schema

The settings are stored in the `quiz_settings` table:

```sql
CREATE TABLE quiz_settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  sparks_per_correct_answer INTEGER NOT NULL DEFAULT 5,
  accuracy_bonus_threshold NUMERIC(3,2) DEFAULT 0.80,
  accuracy_bonus_multiplier NUMERIC(3,2) DEFAULT 1.50,
  good_accuracy_threshold NUMERIC(3,2) DEFAULT 0.60,
  good_accuracy_multiplier NUMERIC(3,2) DEFAULT 1.20,
  max_questions_per_quiz INTEGER DEFAULT 15,
  min_questions_per_quiz INTEGER DEFAULT 5,
  time_per_question_seconds INTEGER DEFAULT 45,
  allow_skip_questions BOOLEAN DEFAULT FALSE,
  show_correct_answers BOOLEAN DEFAULT TRUE,
  show_explanations BOOLEAN DEFAULT TRUE,
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_options BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR
);
```

---

## Implementation Details

### Code Location
- **Sparks Calculation:** `server/routes.ts` (lines 2192-2211)
- **Admin UI:** `client/src/pages/admin/PlatformSettings.tsx`
- **API Endpoints:**
  - GET `/api/admin/settings/quiz` - Fetch current settings
  - PUT `/api/admin/settings/quiz` - Update settings
- **Database Operations:** `server/storage.ts` (getQuizSettings, updateQuizSettings)

### Current Implementation
```typescript
// Get platform settings for sparks calculation
const quizSettings = await storage.getQuizSettings();

// Calculate sparks earned using platform settings
const baseSparks = correctAnswers * quizSettings.sparksPerCorrectAnswer;

// Apply accuracy bonuses based on platform settings
let bonusMultiplier = 1;
if (accuracy >= Number(quizSettings.accuracyBonusThreshold)) {
  bonusMultiplier = Number(quizSettings.accuracyBonusMultiplier);
} else if (accuracy >= Number(quizSettings.goodAccuracyThreshold)) {
  bonusMultiplier = Number(quizSettings.goodAccuracyMultiplier);
}

const sparksEarned = Math.round(baseSparks * bonusMultiplier);
```

---

## Avoiding Duplicates ✅

**Good News:** The system is already consolidated! There's only ONE active sparks calculation system.

### What We Found
1. ✅ **Active System:** Database-driven (quiz_settings table) - Currently in use
2. ⚠️ **Inactive System:** Hardcoded constants (QUIZ_CONSTANTS) - Not currently used

### Recommendation
The database-driven approach is superior because:
- ✅ Fully editable via Admin Panel
- ✅ No code changes needed to adjust rewards
- ✅ Can A/B test different reward structures
- ✅ Changes take effect immediately
- ✅ Settings are backed up with database

**Action:** Continue using the current system. The QUIZ_CONSTANTS are available for future enhanced quiz features but don't interfere with current quiz operations.

---

## Future Enhancement System (Available but Not Active)

There's an enhanced quiz system available at `/api/quizzes/generate` with:
- Difficulty-based sparks (Easy=5, Medium=10, Hard=15)
- Completion bonus (+20 sparks)
- Perfect score bonus (+50 sparks)

This is not currently active but can be enabled in the future if needed.

---

## Summary

✅ **Quiz Questions:** 15 per quiz (standardized)  
✅ **Sparks Per Question:** 5 (configurable in admin settings)  
✅ **Accuracy Bonuses:** 1.5x for 80%+, 1.2x for 60%+  
✅ **Admin Editable:** Yes, via Platform Settings → Quiz Settings  
✅ **No Duplicates:** Single unified system in use  
✅ **Changes Take Effect:** Immediately for new quizzes  

**Admin Access:** `/admin-login` → Platform Settings → Quiz Settings Tab

---

*Last Updated: October 28, 2025*
*Status: ✅ Active and Fully Functional*
