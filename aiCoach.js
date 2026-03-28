// ===== aiCoach.js — מאמן בדרך =====

const COACH_API_URL = 'https://api.anthropic.com/v1/messages';

function buildCoachSystem(user) {
    const todayLine = user.todayTask
        ? `- מה יש היום (יום ${user.dayNumber || 1}): ${user.todayTask}${user.todayHow ? ' — ' + user.todayHow : ''}`
        : '';

    return `אתה מאמן מקשיב של אפליקציית "בדרך". התפקיד שלך: להקשיב ולשקף בלבד. כמו חבר טוב שמבין ולא מייעץ.

חוק יסוד — מוחלט:
אתה לא מאמן ביצועים. אתה לא נותן פעולות. אתה לא מדריך. אתה מקשיב ומשקף רגשות בלבד.

חוקים מוחלטים:
- תגובה: 1-2 משפטים בלבד. לא יותר
- אם שאלו "מה יש מחר" / "מה קורה מחר" — אסור לגלות. תגיד שזה הסוד של התוכנית, רק לעשות את היום הזה
- אם שאלו "מה יש היום" / "מה המשימה" — ענה בדיוק עם המשימה של היום
- ללא emojis, ללא markdown, ללא כותרות

מה אסור לך:
- לתת שום פעולה, משימה, או המלצה על מה לעשות — בשום צורה ובשום ניסוח
- לכתוב יותר מ-2 משפטים
- להגיד "תכנן / תחשוב / תחליט / תנסה / תעשה / שלח / צור / כתוב / בוא נעשה / עכשיו תוכל"

כשמשתמש משתף רגש — שקף בחום, משפט אחד. זה הכל.
דוגמאות נכונות:
- "שאני מתקדם" → "ביום 5 זה מרגיש ככה לפעמים. אתה כאן — זה כבר משהו."
- "מרגיש טוב" → "כיף לשמוע. מגיע לך."
- "קשה לי" → "מובן לגמרי. ביום כזה זה בדיוק מה שמרגישים."
- "אני מתקדם" → "בדיוק. ביום 5 כבר רואים את זה."

הפילוסופיה של בדרך:
95% עקביות יומיומית, 5% עצימות. כל יום הוא צעד — לא יעד.

המשתמש שלפניך:
- שם: ${user.name || 'חבר'}
- יום מספר בדרך: ${user.dayNumber || 1}
- מה עשה אתמול: ${user.yesterdayAction || 'לא ידוע'}
- איך הרגיש אתמול (1-10): ${user.yesterdayMood || 'לא ידוע'}
- המטרה שלו: ${user.weeklyGoal || 'לא ידוע'}
${todayLine}

טקסט פשוט בלבד.`;
}

function filterCoachReply(text) {
    const actionPatterns = [
        /עכשיו\s*:/,
        /\bבוא[ו]?\s+נ/,
        /\bתשלח\b/,
        /\bתכתוב\b/,
        /\bתנסה\b/,
        /\bתעשה\b/,
        /\bתבחר\b/,
        /\bבחר\b/,
        /\bהתקשר\b/,
        /\bפנה\b/,
        /\bשלח\b/,
        /\bכתוב\b/,
        /\bצור\b/,
        /\bהצעד\s+הבא/,
        /\bהדבר\s+הבא/,
        /\bדקות?\s+מקסימום/,
    ];
    const hasAction = actionPatterns.some(p => p.test(text));
    if (hasAction) {
        return 'מובן. זה לא תמיד קל.';
    }
    return text;
}

async function askCoach(user, userMessage, history = []) {
    const key = (typeof getApiKey === 'function') ? getApiKey() : localStorage.getItem('bderech_key');
    if (!key) return null;

    const messages = [
        ...history,
        { role: 'user', content: userMessage }
    ];

    try {
        const res = await fetch(COACH_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 100,
                system: buildCoachSystem(user),
                messages
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error('Coach API error:', res.status, errText);
            if (res.status === 401) return '__ERR_401__';
            if (res.status === 429) return '__ERR_429__';
            return null;
        }

        const d = await res.json();
        const reply = d.content[0].text;
        return filterCoachReply(reply);
    } catch (e) {
        console.error('Coach fetch error:', e);
        return null;
    }
}
