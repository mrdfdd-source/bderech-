const jwt = require('jsonwebtoken');
const db = require('../db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'אין הרשאה - נדרשת כניסה לחשבון' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_baderech');

    const user = await db.users.findOneAsync({ _id: decoded.userId });
    if (!user) {
      return res.status(401).json({ message: 'משתמש לא נמצא' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'פג תוקף החיבור - אנא התחבר שוב' });
    }
    return res.status(401).json({ message: 'אין הרשאה - טוקן לא תקין' });
  }
};

module.exports = authMiddleware;
