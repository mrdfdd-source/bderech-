const { getChatResponse, getMovementHelp } = require('../services/aiService');

// In-memory session store
const chatSessions = new Map();

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, goal } = req.body;
    const userId = req.user.id.toString();

    if (!message) {
      return res.status(400).json({ message: 'הודעה ריקה' });
    }

    const key = `${userId}_${sessionId || 'default'}`;
    if (!chatSessions.has(key)) {
      chatSessions.set(key, { messages: [], questionCount: 0, goal: goal || '' });
    }

    const session = chatSessions.get(key);
    session.messages.push({ role: 'user', content: message });

    const { message: aiMessage, isReady } = await getChatResponse(session.messages, session.questionCount);

    session.messages.push({ role: 'assistant', content: aiMessage });
    if (!isReady) session.questionCount += 1;

    // Clean old sessions
    if (chatSessions.size > 1000) {
      chatSessions.delete(chatSessions.keys().next().value);
    }

    res.json({ message: aiMessage, isReady, questionCount: session.questionCount });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'שגיאה בשיחה עם המאמן' });
  }
};

exports.movementHelp = async (req, res) => {
  try {
    const { question, goal, movementAction, movementInstruction } = req.body;
    if (!question) return res.status(400).json({ message: 'שאלה ריקה' });
    const answer = await getMovementHelp(goal || '', movementAction || '', movementInstruction || '', question);
    res.json({ answer });
  } catch (err) {
    console.error('Movement help error:', err);
    res.status(500).json({ message: 'שגיאה בשיחה עם המאמן' });
  }
};

exports.clearSession = (req, res) => {
  const userId = req.user.id.toString();
  const { sessionId } = req.body;
  chatSessions.delete(`${userId}_${sessionId || 'default'}`);
  res.json({ message: 'Session cleared' });
};
