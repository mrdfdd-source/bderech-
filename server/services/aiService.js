const OpenAI = require('openai');

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// Goal-aware mock question generator
function getMockQuestion(goal, questionCount) {
  const g = (goal || '').toLowerCase();

  const questions = {
    running: ['כמה אתה רץ היום? (בכלל לא / קצת / יש לי בסיס)'],
    sport:   ['מה רמת הכושר הנוכחית שלך?'],
    japanese:['יש לך כבר ספר, אפליקציה כמו Duolingo, או מתחיל מאפס לגמרי?'],
    language:['יש לך כבר חומר לימוד (ספר / אפליקציה), או עדיין לא?'],
    guitar:  ['יש לך גיטרה בבית?'],
    music:   ['יש לך את הכלי בבית, או צריך קודם להשיג?'],
    book:    ['כבר התחלת לכתוב משהו, גם שורה אחת?'],
    writing: ['כבר יש לך רעיון / נושא, או עדיין מחפש?'],
    default: ['יש לך כבר מה שצריך כדי להתחיל, או שצריך קודם להשיג משהו?']
  };

  let key = 'default';
  if (g.includes('ריצ') || g.includes('מרתון') || g.includes('5 קמ')) key = 'running';
  else if (g.includes('ספורט') || g.includes('כושר') || g.includes('שריר')) key = 'sport';
  else if (g.includes('יפנ') || g.includes('japanese')) key = 'japanese';
  else if (g.includes('שפ') || g.includes('ספרד') || g.includes('צרפת') || g.includes('אנגל')) key = 'language';
  else if (g.includes('גיטר')) key = 'guitar';
  else if (g.includes('מוזיק') || g.includes('נגינ') || g.includes('פסנת') || g.includes('הרמוניק')) key = 'music';
  else if (g.includes('ספר') || g.includes('רומן')) key = 'book';
  else if (g.includes('כתיב') || g.includes('כתיבה')) key = 'writing';

  return (questions[key] || questions.default)[0];
}

const MOCK_PLANS = {
  running: {
    totalDays: 21,
    shape: 'shoe',
    movements: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      action: i === 0 ? 'הכנת ציוד' : `ריצה יום ${i}`,
      instruction:
        i === 0
          ? 'בלבש נעלי ריצה והרגש אותן על הרגליים. עמוד, נשום עמוק 3 פעמים, ותחשוב על 7 דקות שמחר תצא לרוץ. הכן את בגדי הריצה ושים אותם על הכיסא - מוכן לבוקר.'
          : `צא מהבית ורוץ ${Math.min(i * 200, 2000)} מטר בקצב נוח. אם אתה נושם קשה - האט. המטרה היא להרגיש טוב, לא מותש. 7 דקות בדיוק, אז עצור.`
    }))
  },
  book: {
    totalDays: 90,
    shape: 'book',
    movements: Array.from({ length: 90 }, (_, i) => ({
      day: i + 1,
      action: i === 0 ? 'הכנת סביבת כתיבה' : `כתיבה יום ${i}`,
      instruction:
        i === 0
          ? 'פתח מסמך חדש ושמור אותו בשם "הספר שלי". כתוב כותרת זמנית וכתוב משפט אחד: "הסיפור הזה מתחיל כי..." - כל מה שמגיע. שמור ותסגור.'
          : `כתוב 150-200 מילה על הפרק הנוכחי. אל תתקן, אל תמחק - רק כתוב קדימה. 7 דקות טהורות של כתיבה ללא עצירות.`
    }))
  },
  harmonica: {
    totalDays: 21,
    shape: 'harmonica',
    movements: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      action: i === 0 ? 'פגישה ראשונה עם ההרמוניקה' : `תרגול יום ${i}`,
      instruction:
        i === 0
          ? 'קח את ההרמוניקה, נקה אותה בעדינות. שים אותה על השפתיים ופשוט נשום דרכה - שאיפה ונשיפה. 3 דקות של נשימה, 4 דקות של חקירה - כל חור בנפרד.'
          : `נגן את הסולם הבסיסי: חורים 4-5-6 נשיפה. חזור 10 פעמים לאט, 10 פעמים מהר. אז תנסה להשמיע צליל שמזכיר לך שמחה.`
    }))
  },
  japanese: {
    totalDays: 21,
    shape: 'star',
    movements: [
      { day: 1, action: 'פתיחת ספר/סרטון יפנית', instruction: 'פתח YouTube, חפש "Japanese for beginners lesson 1". צפה ב-7 דקות ראשונות. עצור. אל תכתוב, אל תחזור — רק תצפה.' },
      { day: 2, action: 'הגיית 10 מילים', instruction: 'חפש "10 basic Japanese words". אמר כל מילה בקול רם 3 פעמים. לא לזכור — רק לאמר. こんにちは (konnichiwa), ありがとう (arigatou) ועוד 8.' },
      { day: 3, action: 'ספרות 1-10 ביפנית', instruction: 'פתח גוגל וחפש "Japanese numbers 1-10". קרא בקול רם: いち、に、さん、し、ご、ろく、なな、はち、きゅう、じゅう. חזור 5 פעמים.' },
      { day: 4, action: 'ברכות יפניות', instruction: 'למד 3 ברכות: おはよう (ohayou) = בוקר טוב, こんにちは (konnichiwa) = שלום, さようなら (sayonara) = להתראות. אמר כל אחת 10 פעמים בקול.' },
      { day: 5, action: 'Hiragana — שורה ראשונה', instruction: 'פתח "hiragana chart" בגוגל. תרגל רק שורה א: あ い う え お. כתוב כל אות 5 פעמים על נייר. 7 דקות, רק 5 אותיות.' },
      { day: 6, action: 'Hiragana — שורה שנייה', instruction: 'שורת K: か き く け こ. כתוב כל אחת 5 פעמים. אחר כך כתוב בלי להסתכל — מה שיוצא.' },
      { day: 7, action: 'שיחה קצרה ביפנית', instruction: 'פתח YouTube, חפש "Japanese basic conversation practice". צפה ב-7 דקות. עצור כשמגיע לדיאלוג, חזור עליו בקול.' },
      ...Array.from({ length: 14 }, (_, i) => ({
        day: i + 8,
        action: `תרגול יום ${i + 8}`,
        instruction: i % 3 === 0
          ? 'פתח Duolingo / YouTube ותרגל 7 דקות יפנית. כל מה שמגיע — מילים, אותיות, שיר. רק תשמע ותאמר בקול.'
          : i % 3 === 1
          ? 'כתוב 5 מילים יפניות שאתה זוכר על נייר, בלי לחפש. אחר כך בדוק. לא משנה כמה טעיות — זה הלמידה.'
          : 'פתח סרטון יפני (anime, vlog, שיר). צפה 7 דקות. אל תקרא כתוביות. רק תקשיב לצלילים.'
      }))
    ]
  },
  default: {
    totalDays: 21,
    shape: 'star',
    movements: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      action: i === 0 ? 'הצעד הראשון' : `תנועה יום ${i + 1}`,
      instruction:
        i === 0
          ? 'פתח דפדפן ותחפש מקור אחד קונקרטי שיעזור לך להתחיל — ספר, קורס, סרטון, כלי. תפתח אותו. זה הכל להיום.'
          : `עשה פעולה אחת פיזית ומוחשית של 7 דקות לכיוון המטרה שלך. לא לחשוב, לא לתכנן — לגעת, לכתוב, לנגן, לזוז. 7 דקות, אז עצור.`
    }))
  }
};

function getMockPlan(goal) {
  const goalLower = goal.toLowerCase();
  if (goalLower.includes('ריצ') || goalLower.includes('ספורט') || goalLower.includes('5 קמ') || goalLower.includes('מרתון')) {
    return MOCK_PLANS.running;
  }
  if (goalLower.includes('ספר') || goalLower.includes('כתיב') || goalLower.includes('רומן')) {
    return MOCK_PLANS.book;
  }
  if (goalLower.includes('הרמוניק') || goalLower.includes('גיטר') || goalLower.includes('נגינ') || goalLower.includes('מוזיק')) {
    return MOCK_PLANS.harmonica;
  }
  if (goalLower.includes('יפנ') || goalLower.includes('japanese') || goalLower.includes('ספרד') || goalLower.includes('צרפת') || goalLower.includes('שפ')) {
    return MOCK_PLANS.japanese;
  }
  return MOCK_PLANS.default;
}

async function getChatResponse(messages, questionCount) {
  const client = getOpenAIClient();

  if (!client) {
    if (questionCount >= 1) {
      return { message: 'בניתי לך תוכנית', isReady: true };
    }
    // Extract goal from first user message
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const goal = firstUserMsg ? firstUserMsg.content : '';
    return { message: getMockQuestion(goal, questionCount), isReady: false };
  }

  try {
    const systemPrompt = `אתה מאמן "בדרך" - מאמן מנטלי חם, תומך ומדויק.
הפילוסופיה: תנועה קטנה יומית של 7 דקות — זה קבוע, אל תשאל על זמן.

המשתמש כבר אמר לך את היעד שלו. כעת שאל רק את מה שחסר לך כדי לבנות תוכנית מדויקת.
דוגמאות לשאלות טובות:
- "ריצה" → "כמה אתה רץ היום? בכלל לא / קצת / יש לי בסיס"
- "יפנית" → "יש לך כבר ספר/אפליקציה, או מתחיל מאפס?"
- "גיטרה" → "יש לך גיטרה בבית?"
- "כתיבת ספר" → "כבר התחלת לכתוב משהו?"

כללים:
- שאל מקסימום 3 שאלות בסך הכל, רק מה שבאמת משנה לתוכנית
- אל תשאל שאלות רגשיות ("מה מניע אותך") — רק פרקטי
- אל תשאל על זמן — 7 דקות קבוע
- כשיש לך מספיק מידע (גם אחרי שאלה אחת אם מספיק) — כתוב בדיוק: "בניתי לך תוכנית"
- דבר בעברית בלבד, קצר וחם
- שאלות שנשאלו עד כה: ${questionCount}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 200,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const isReady = content.includes('בניתי לך תוכנית');

    return { message: content, isReady };
  } catch (err) {
    console.error('OpenAI chat error:', err);
    if (questionCount >= 2) {
      return { message: 'בניתי לך תוכנית', isReady: true };
    }
    return { message: MOCK_COACH_RESPONSES[questionCount] || 'בניתי לך תוכנית', isReady: questionCount >= 2 };
  }
}

async function getMovementHelp(goal, movementAction, movementInstruction, question) {
  const client = getOpenAIClient();

  const systemPrompt = `אתה מאמן "בדרך" - מאמן חם ותומך.
המשתמש יש לו יעד ותנועה יומית. הוא שואל שאלה על התנועה.
ענה בעברית, קצר (2-3 משפטים), חם ומדויק.
הסבר **בדיוק** למה הפעולה הזו מקדמת את היעד הספציפי שלו.
אל תהיה כללי — התייחס לפרטים.`;

  const userMessage = `יעד: ${goal}
תנועה: ${movementAction}
הוראה: ${movementInstruction}
שאלה: ${question}`;

  if (!client) {
    return `הפעולה הזו קשורה ישירות ליעד שלך — ${goal}. כל תנועה קטנה בונה הרגל שמקרב אותך למטרה. 7 דקות ביום, כל יום, זה הסוד.`;
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('Movement help error:', err);
    return `הפעולה הזו קשורה ישירות ליעד שלך. כל תנועה קטנה בונה הרגל שמקרב אותך למטרה. שאל שוב בעוד רגע.`;
  }
}

async function generatePlan(goal, motivation, priorExperience, chatHistory) {
  const client = getOpenAIClient();

  if (!client) {
    // Return mock plan based on goal
    const mockPlan = getMockPlan(goal);
    return mockPlan;
  }

  try {
    const systemPrompt = `אתה מאמן "בדרך" - מאמן מנטלי שבונה תוכניות יומיות מותאמות אישית.
הפילוסופיה: תנועה קטנה יומית (7 דקות) + עצירה כפויה = בניית התמדה אמיתית.

בנה תוכנית JSON עם המבנה:
{
  "totalDays": number,
  "shape": "shoe|book|harmonica|star|heart|rocket",
  "movements": [
    {"day": 1, "action": "כותרת קצרה", "instruction": "הוראה מדויקת ל-7 דקות"}
  ]
}

כללי אורך:
- 21 יום: מיומנויות בסיסיות (ריצה, כלי נגינה, שפה)
- 30 יום: עסקים, שיווק, בניית לקוחות
- 90-120 יום: מטרות מורכבות מאוד (כתיבת ספר)

כללי תוכן:
- כל תנועה = פעולה פיזית וקונקרטית שניתן לעשות ב-7 דקות בדיוק
- אסור: "שב וחשב", "תכנן", "תרגיש", "כתוב שיחה פיקטיבית", "כתוב דמויות".
- מותר: "פתח", "כתוב", "אמר בקול", "שלח", "חפש", "צלם", "דבר עם"

דוגמאות לפי סוג מטרה:
- ריצה: "צא וכסה 500 מטר בקצב נוח. עצור אחרי 7 דקות."
- יפנית: "אמר 10 מילים בסיסיות ביפנית בקול רם."
- עסק / אימון / שיווק: "שלח הודעה ל-3 אנשים שאתה מכיר ושאל אם הם מכירים מישהו שיכול להרוויח מ-[יעד]", "כתוב פוסט קצר על הנושא שלך ושמור (אל תפרסם עדיין)", "הכן רשימה של 5 לקוחות פוטנציאליים עם שם ואיך לפנות"
- כתיבת ספר: "כתוב 150 מילה קדימה ללא עריכה."
- כושר: "עשה 3 סטים של 10 חזרות."

CRITICAL: כל תנועה חייבת להיות קשורה ישירות למטרה שהמשתמש הגדיר. אם המטרה היא עסק — כל תנועה היא פעולה עסקית. אם זה ריצה — כל תנועה היא ריצה/ספורט. אסור לערבב.
Shape: shoe=ריצה/ספורט, book=כתיבה, harmonica=מוזיקה, star=כללי, heart=מערכות יחסים, rocket=עסקים/יזמות

החזר JSON בלבד, ללא טקסט נוסף.`;

    const userMessage = `מטרה: ${goal}
מניע: ${motivation}
ניסיון קודם: ${priorExperience}
שיחה: ${chatHistory}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 4000,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate structure
    if (!parsed.totalDays || !parsed.movements || !Array.isArray(parsed.movements)) {
      throw new Error('Invalid plan structure');
    }

    return parsed;
  } catch (err) {
    console.error('OpenAI plan generation error:', err);
    return getMockPlan(goal);
  }
}

module.exports = { getChatResponse, generatePlan, getMovementHelp };
