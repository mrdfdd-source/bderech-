const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_baderech';

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'אנא מלא את כל השדות' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'סיסמה חייבת להכיל לפחות 6 תווים' });
    }

    const existing = await db.users.findOneAsync({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'כתובת האימייל הזו כבר רשומה במערכת' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.users.insertAsync({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      notificationTime: '08:00',
      createdAt: new Date().toISOString()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'ברוך הבא לבדרך!',
      token,
      user: { id: user._id, email: user.email, name: user.name, notificationTime: user.notificationTime }
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.errorType === 'uniqueViolated') {
      return res.status(400).json({ message: 'כתובת האימייל הזו כבר קיימת' });
    }
    res.status(500).json({ message: 'שגיאה בהרשמה, אנא נסה שוב' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'אנא הכנס אימייל וסיסמה' });
    }

    const user = await db.users.findOneAsync({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'ברוך הבא חזרה!',
      token,
      user: { id: user._id, email: user.email, name: user.name, notificationTime: user.notificationTime }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'שגיאה בכניסה, אנא נסה שוב' });
  }
};

exports.getMe = (req, res) => {
  const u = req.user;
  res.json({
    user: { id: u._id, email: u.email, name: u.name, notificationTime: u.notificationTime }
  });
};
