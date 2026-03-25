# בדרך (BaDerech) — CLAUDE.md

## מה האפליקציה עושה
אפליקציית ווב לאימון אישי יומי. המשתמש מגדיר מטרה, מאמן AI שואל עד 3 שאלות, ומייצר תוכנית של 21-90 ימים עם 3 תנועות ליום (כל תנועה = 7 דקות בדיוק). LightMap מציג את ההתקדמות כ"נורות" זוהרות.

## הרצת הפרויקט

```bash
# Server (port 5000)
cd server && npm run dev

# Client (port 5173)
cd client && npm run dev
```

**דרישות:** קובץ `server/.env` (העתק מ-`.env.example`). OpenAI key אופציונלי — בלעדיו יש mock.

## מבנה הקוד

```
client/src/
  pages/        # Welcome → Auth → Onboarding → Chat → Dashboard → Map
  components/   # ChatBubble, LightMap, MovementCard, Timer
  context/      # AppContext.jsx — global state עם useReducer
  services/     # api.js — Axios עם JWT interceptor

server/
  controllers/  # authController, chatController, planController
  models/       # User.js, Plan.js, DailyMovement.js (schemas בלבד)
  routes/       # auth.js, chat.js, plans.js
  services/     # aiService.js — OpenAI + mock fallback
  db.js         # NeDB initialization
  data/*.db     # קבצי המסד נתונים
```

## API Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/auth/register` | הרשמה |
| POST | `/api/auth/login` | התחברות |
| GET | `/api/plans/current` | תוכנית פעילה |
| POST | `/api/plans` | יצירת תוכנית חדשה |
| POST | `/api/plans/:id/complete` | סימון יום הושלם |
| GET | `/api/plans/:id/map` | נתוני LightMap |
| DELETE | `/api/plans/:id` | נטישת תוכנית |
| POST | `/api/chat/message` | שליחת הודעה למאמן |

## מסד הנתונים (NeDB)

`db.js` מייצא: `db.users`, `db.plans`, `db.movements`, `db.dailyMovements`
קבצים: `server/data/*.db` (לא לעדכן ידנית)

## AI Logic

**`aiService.js`:**
- `getChatResponse()` — מאמן שואל עד 3 שאלות, מחזיר `{ message, isReady }`
- `generatePlan()` — מייצר תוכנית JSON: `{ totalDays, shape, movements[] }`
- כשאין OpenAI key → mock plans לפי מילות מפתח בעברית

**Shapes:** `shoe` (ריצה), `book` (כתיבה), `harmonica` (מוזיקה), `star` (כללי), `heart`, `rocket`

## State Management (AppContext)

Actions: `SET_AUTH`, `LOGOUT`, `SET_CURRENT_PLAN`, `UPDATE_ONBOARDING`, `COMPLETE_TODAY`, `SET_LOADING`, `SET_ERROR`, `CLEAR_ERROR`

## פילוסופיית המוצר

### הרעיון המרכזי
אנחנו נולדים ערומים — לא רק פיזית. יוצאים לעולם ואז סוחבים איתנו הצלחות, כישלונות, ציפיות, אכזבות... מעמיסים את ה"תיק" שיצאנו איתו עד שאנחנו לא יכולים לזוז.

### שלושת עמודי התווך
1. **להוריד את התיק** — לשחרר את המשקל הנפשי שנצבר
2. **להיות בתנועה** — לנוע קדימה, אפילו קצת, כל יום
3. **חמלה עצמית + 95/5** — 95% מהחיים הם שגרה אפורה ומאמץ. רק 5% הם רגעי שיא. האפליקציה מלמדת לאהוב את ה-95

### למי האפליקציה מיועדת
לאנשים שקשה להם להתמיד — שמתחילים הכל בעוצמה גבוהה אבל נשרפים מהר כי המוטיבציה נגמרת. המחזור המוכר:
> מוטיבציה גבוהה → פעולה אינטנסיבית → שחיקה → פרישה → מוטיבציה גבוהה → ...

התוצאה: תחושה של חוסר התקדמות, אי-מציאת עצמם.

### הפתרון
לא יותר מוטיבציה — אלא **מנגנון**: פעולות קטנות, קבועות, שניתן להתמיד בהן לאורך זמן. 7 דקות ביום. עצירה כפויה. בלי לשאוף לשיא — רק לא לעצור.

**כשכותבים קוד, טקסטים, או הודעות — לזכור:** האפליקציה לא מתגמלת מאמץ גדול, אלא נוכחות קבועה. הטון תמיד חם, לא שיפוטי, ולא מעודד "עוד יותר".

## כללי עבודה

- **שפה:** UI בעברית בלבד, RTL
- **טיימר:** 7 דקות קבוע — לא לשאול עליו, לא לשנות
- **פילוסופיה:** תנועה קטנה + עצירה כפויה = התמדה. אין ביקורת עצמית
- **הודעות:** חמות וקצרות — "אתה בדרך ליעד, לא קרה כלום"
- **Mock:** כל feature חייב לעבוד גם ללא OpenAI key

## משתני סביבה (`server/.env`)

```
PORT=5000
JWT_SECRET=your_secret
OPENAI_API_KEY=sk-...   # אופציונלי
NODE_ENV=development
```
