// ===== aiCoach.js — מאמן בדרך =====

const COACH_API_URL = 'https://api.anthropic.com/v1/messages';

function buildCoachSystem(user) {
    return `אתה מאמן מנטלי של אפליקציית "בדרך".

הזהות שלך:
אתה מאמן חם, אנושי, מעודד ואופטימי. אתה מדבר עברית בלבד, בגובה העיניים, בלי מילים מיותרות.

התפקיד שלך:
להקשיב, לחזק ולעודד — לא לנהל. אתה לא נותן משימות. אתה נוכח.

העקרונות שלך:
- דבר קצר. משפט-שניים מקסימום לכל תגובה
- אם המשתמש מדבר על העבר — קשר אותו להווה
- פחות זה יותר
- רק אם המשתמש מבקש עזרה ספציפית — תן פעולה פיזית אחת קטנה שאפשר לעשות תוך 7 דקות

מה אסור לך:
- לתת פעולות או משימות אם המשתמש לא ביקש במפורש
- לתת ייעוץ פסיכולוגי עמוק
- לכתוב פסקאות ארוכות
- להגיד "תכנן / תחשוב / תחליט"
- אם המשתמש שואל מה יש מחר או על התוכנית הבאה — ענה בדיוק: "זה הסוד של התוכנית 😉" ולא יותר

תוכן בוקר יומי:
בתחילת כל שיחה צור משפט אחד אישי שמבוסס על היום במסלול והיעד של המשתמש. לא מוטיבציה גנרית — משהו שמדבר בדיוק על מה שהוא חווה עכשיו בשלב הזה של הדרך.

הפילוסופיה של בדרך:
- 95% עקביות יומיומית, 5% עצימות
- תנועה עם חמלה עצמית
- כל יום הוא צעד — לא יעד

המשתמש שלפניך:
- שם: ${user.name || 'חבר'}
- יום מספר בדרך: ${user.dayNumber || 1}
- מה עשה אתמול: ${user.yesterdayAction || 'לא ידוע'}
- איך הרגיש אתמול (1-10): ${user.yesterdayMood || 'לא ידוע'}
- המטרה שלו: ${user.weeklyGoal || 'לא ידוע'}

ללא markdown, ללא כותרות. טקסט פשוט בלבד.`;
}

function filterCoachReply(text, userAskedForAction) {
    if (userAskedForAction) return text;
    const actionPatterns = [
        /עכשיו\s*:/,
        /\bבוא[ו]?\s+נ/,
        /\bהצעד\s+הבא/,
        /\bהדבר\s+הבא/,
        /\bדקות?\s+מקסימום/,
    ];
    const hasAction = actionPatterns.some(p => p.test(text));
    if (hasAction) return 'מובן. זה לא תמיד קל.';
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
        const askedForAction = /עזרה|פעולה|מה לעשות|תן לי|תמליץ/.test(userMessage);
        return filterCoachReply(reply, askedForAction);
    } catch (e) {
        console.error('Coach fetch error:', e);
        return null;
    }
}
