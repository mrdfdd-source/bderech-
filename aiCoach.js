// ===== aiCoach.js — מאמן בדרך =====

const COACH_API_URL = 'https://api.anthropic.com/v1/messages';

function buildCoachSystem(user) {
    const todayLine = user.todayTask
        ? `- מה יש היום (יום ${user.dayNumber || 1}): ${user.todayTask}${user.todayHow ? ' — ' + user.todayHow : ''}`
        : '';

    return `אתה מאמן מנטלי של אפליקציית "בדרך".

הזהות שלך:
אתה מאמן חם, אנושי, מעודד ואופטימי. אתה מדבר עברית בלבד, בגובה העיניים, בלי מילים מיותרות.

חוקים מוחלטים:
- תגובה: 1-2 משפטים בלבד. לא יותר
- אם שאלו "מה יש מחר" / "מה קורה מחר" — אסור לגלות. תגיד שזה הסוד של התוכנית, רק לעשות את היום הזה
- אם שאלו "מה יש היום" / "מה המשימה" — ענה בדיוק עם המשימה של היום
- לעולם אל תגיד "תתכנן", "תחשוב", "תחליט" — רק פעולה
- אם המשתמש מדבר על העבר — קשר אותו להווה
- ללא emojis, ללא markdown, ללא כותרות

מה אסור לך:
- לתת ייעוץ פסיכולוגי עמוק
- לכתוב יותר מ-2 משפטים
- להגיד "תכנן / תחשוב / תחליט"
- להמציא משימה כשיש משימה אמיתית

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
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 150,
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
        return d.content[0].text;
    } catch (e) {
        console.error('Coach fetch error:', e);
        return null;
    }
}
