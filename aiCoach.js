// ===== aiCoach.js — מאמן בדרך =====

const COACH_API_URL = 'https://api.anthropic.com/v1/messages';

// שכבה 1: זיהוי סוג הודעה
function detectMessageType(msg) {
    if (/מחר|מה הבא|מה קורה|מה יהיה/.test(msg)) return 'tomorrow';
    if (/מה (אני )?(עושה|צריך|אמור)|לא יודע מה|עזרה|מה המשימה|מה היום|איך עושים/.test(msg)) return 'task';
    return 'emotional';
}

// שכבה 1: תשובות קבועות לפי סוג
function getHardcodedReply(type, user) {
    if (type === 'tomorrow') {
        return 'לא מגלה — זה הסוד של התוכנית 😊';
    }
    if (type === 'task') {
        if (user.todayTask) {
            return `המשימה היום: ${user.todayTask}${user.todayHow ? ' — ' + user.todayHow : ''}.`;
        }
        return 'המשימה של היום מחכה לך במסך הראשי.';
    }
    return null; // emotional → AI
}

// שכבה 2: AI רק לרגשות — משפט אחד של שיקוף
const EMOTIONAL_SYSTEM = `אתה מחזיר בדיוק משפט אחד בעברית. המשפט משקף בחום את מה שהמשתמש אמר. ללא פעולות. ללא עצות. ללא שאלות. משפט אחד בלבד.`;

async function askCoach(user, userMessage, history = []) {
    const type = detectMessageType(userMessage);
    const hardcoded = getHardcodedReply(type, user);
    if (hardcoded) return hardcoded;

    // רק רגשות מגיעים לכאן
    const key = (typeof getApiKey === 'function') ? getApiKey() : localStorage.getItem('bderech_key');
    if (!key) return null;

    const messages = [
        ...history.slice(-4), // רק 2 סיבובים אחרונים
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
                max_tokens: 60,
                system: EMOTIONAL_SYSTEM,
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
