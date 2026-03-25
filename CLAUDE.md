# בדרך — bderech-deploy

## ⚠️ חשוב: זו האפליקציה החיה
- קובץ אחד: `index.html` (~1600 שורות, vanilla JS)
- GitHub Pages: https://mrdfdd-source.github.io/bderech-/
- GitHub repo: https://github.com/mrdfdd-source/bderech-

## תיקיות
| תיקייה | תפקיד |
|--------|--------|
| `C:\Users\dov\bderech-deploy\` | ✅ האפליקציה החיה — לעבוד כאן |
| `C:\Users\dov\bderech-app\` | ✅ שרת Express + Anthropic SDK |
| `C:\Users\dov\baderech-archive\` | ❌ ארכיון React — לא לגעת |

## Stack
- Vanilla HTML/CSS/JS (קובץ אחד, ללא frameworks)
- Claude Haiku (claude-haiku-4-5-20251001) — קריאה ישירה מהדפדפן
- localStorage לכל ה-state
- Service Worker לPWA

## מבנה ה-state (localStorage)
```
currentGoal, goalType, fullPlan[], totalMoves, completedMoves,
currentDay, litIndices[], allIndices[], shapeType, shapeName,
completedHistory[], hardDays[]
```

## פיצ'רים קיימים
- AI coach שואל 3 שאלות → תוכנית 5 ימים
- טיימר 7 דקות (SVG ring)
- מפת התקדמות (grid nodes) — נודים מואירים קליקביליים
- Stop ritual אחרי כל יום
- Popup היסטוריה לכל יום שהושלם
- Hard day marker (כוכב זהב)
- Coach FAB בכל מסך
- נעילה יומית + ספירה לאחור

## באגים קריטיים שנפתרו — אל תחזור עליהם

### 1. bracket counter לא string-aware
- `]` בתוך string עברי שבר את extractJSON()
- **פתרון:** inStr + esc tracking ב-extractJSON()

### 2. detectGoalType החזיר 'כתיבה' לכל יעד
- **פתרון:** default = 'כללי', templates לבישול/עסק/כושר/כללי

### 3. נודים במפה לא קליקביליים במובייל
- **פתרון:** נודים מואירים הם `<button>` (לא div)

### 4. AI JSON עם unescaped double quotes
- **פתרון:** repairJSON() state machine

### 5. PWA לא מתעדכן
- **פתרון:** bump cache version ב-sw.js (עכשיו v5)

## Git / Deploy
- כל שמירת קובץ → hook אוטומטי → git commit + push → GitHub Pages מתעדכן
- אם לא עלה: `cd /c/Users/dov/bderech-deploy && git add -A && git commit -m "msg" && git push origin main`
- לאחר push: לסגור ולפתוח PWA (Service Worker מתעדכן)

## מה עוד חסר (TODO)
- תזכורות push — לא עובדות עדיין. פתרון מתוכנן: OneSignal (חינמי, ללא שרת)
