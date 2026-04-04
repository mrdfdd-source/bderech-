// ===== aiCoach.js — מאמן בדרך =====

const COACH_API_URL = 'https://api.anthropic.com/v1/messages';

// שכבה 1: זיהוי סוג הודעה
function detectMessageType(msg) {
    // רק שאלה ישירה על מחר — לא כשמזכירים מחר בהקשר אחר
    if (/מה (יהיה |קורה )?מחר|מה (הבא|המשימה הבאה|אחרי זה)/.test(msg)) return 'tomorrow';
    if (/מה (אני )?(עושה|צריך|אמור)|לא יודע מה|עזרה|מה המשימה|מה היום|איך עושים/.test(msg)) return 'task';
    return 'emotional';
}

// שכבה 1: תשובות קבועות לפי סוג
function getHardcodedReply(type, user) {
    if (type === 'tomorrow') {
        return 'זה יפתיע אותך.';
    }
    if (type === 'task') {
        if (user.todayTask) {
            return `המשימה היום: ${user.todayTask}${user.todayHow ? ' — ' + user.todayHow : ''}.`;
        }
        return 'המשימה של היום מחכה לך במסך הראשי.';
    }
    return null; // emotional → AI
}

// שכבה 2: AI לרגשות — נוכחות אמיתית
function getEmotionalSystem(user) {
    const name = user.name || '';
    const genderNote = user.gender === 'נקבה'
        ? 'פנה בלשון נקבה (את, שלך וכו\')'
        : 'פנה בלשון זכר (אתה, שלך וכו\')';
    const nameNote = name ? `קרא למשתמש בשם ${name} אם מתאים.` : '';
    return `אתה מאמן AI — אתה תמיד מדבר על עצמך בלשון זכר: "אני יכול", "אני מבין", "אני מציע".
${genderNote}. ${nameNote}
השב במשפט אחד בעברית שמשקף בחום את מה שנאמר.

חוקים:
- שקף מה שנאמר — אל תסגור, אל תנתב, אל תייעץ
- אם נאמר משהו רגשי — היה נוכח עם זה, לא מעבר ממנו
- לעולם אל תאמר "נפגשים מחר" — זה סוגר רגעים חשובים
- לעולם אל תזכיר "תוכנית"
- אסור סלנג: לא "שעוקץ", לא "מדליק", לא "זנק", לא "וויב", לא "כיף לשמוע", לא "מגניב"
- אסור: "אני שומע" בכל צורה, "אני רואה" בכל צורה — אלה תרגומי סלנג אנגלי
- עברית בלבד — אסור מילים בשפות אחרות
- אסור המצאת מילים — רק מילים עבריות קיימות
- ללא אמוג'ים
- עברית פשוטה וישירה — כמו שמבוגר רגיל מדבר
- משפט אחד בלבד`;
}

async function askCoach(user, userMessage, history = []) {
    const type = detectMessageType(userMessage);
    const hardcoded = getHardcodedReply(type, user);
    if (hardcoded) return hardcoded;

    // רק רגשות מגיעים לכאן
    const key = (typeof getApiKey === 'function') ? getApiKey() : localStorage.getItem('bderech_key');
    if (!key) return null;

    const nameStr = user.name ? ` (${user.name})` : '';
    const ctx = `[הקשר: יום ${user.dayNumber} בדרך${nameStr}. יעד: ${user.weeklyGoal}. משימה היום: ${user.todayTask || 'לא ידוע'}.]`;
    const messages = [
        ...history.slice(-4),
        { role: 'user', content: `${ctx}\n${userMessage}` }
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
                system: getEmotionalSystem(user),
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
