const db = require('../db');
const { generatePlan } = require('../services/aiService');

exports.createPlan = async (req, res) => {
  try {
    const { goal, motivation, priorExperience, notificationTime, chatHistory } = req.body;
    const userId = req.user._id;

    const existingPlan = await db.plans.findOneAsync({ userId, status: 'active' });
    if (existingPlan) {
      return res.status(400).json({
        message: 'כבר יש לך יעד פעיל. כדי להתחיל חדש עליך לנסות את הנוכחי קודם.'
      });
    }

    const planData = await generatePlan(goal, motivation || '', priorExperience || '', chatHistory || '');

    const plan = await db.plans.insertAsync({
      userId,
      goal,
      motivation: motivation || '',
      priorExperience: priorExperience || '',
      totalDays: planData.totalDays,
      currentDay: 1,
      status: 'active',
      shape: planData.shape || 'star',
      startedAt: new Date().toISOString(),
      lastActivityAt: null
    });

    // Insert movements
    const movementDocs = planData.movements.map((m) => ({
      planId: plan._id,
      day: m.day,
      action: m.action,
      instruction: m.instruction,
      completed: false,
      completedAt: null
    }));
    await db.movements.insertAsync(movementDocs);

    if (notificationTime) {
      await db.users.updateAsync({ _id: userId }, { $set: { notificationTime } });
    }

    const movements = await db.movements.findAsync({ planId: plan._id }).sort({ day: 1 });
    res.status(201).json({ message: 'התוכנית נוצרה בהצלחה!', plan: { ...plan, movements } });
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ message: 'שגיאה ביצירת התוכנית, אנא נסה שוב' });
  }
};

exports.getCurrentPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const plans = await db.plans.findAsync({ userId, status: 'active' }).sort({ startedAt: -1 });
    const plan = plans[0];

    if (!plan) {
      return res.status(404).json({ message: 'לא נמצאה תוכנית פעילה', plan: null });
    }

    const movements = await db.movements.findAsync({ planId: plan._id }).sort({ day: 1 });
    const completedDays = movements.filter((m) => m.completed).length;
    const todayMovement = movements.find((m) => m.day === plan.currentDay);
    const todayCompleted = todayMovement ? todayMovement.completed : false;

    let missedDaysMessage = null;
    if (plan.lastActivityAt) {
      const daysSinceLast = Math.floor(
        (Date.now() - new Date(plan.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLast > 1 && !todayCompleted) {
        missedDaysMessage = 'אתה בדרך ליעד, לא קרה כלום. פשוט כנס ונמשיך...';
      }
    }

    res.json({ plan: { ...plan, movements }, todayCompleted, completedDays, missedDaysMessage });
  } catch (err) {
    console.error('Get current plan error:', err);
    res.status(500).json({ message: 'שגיאה בטעינת התוכנית' });
  }
};

exports.completeToday = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const plan = await db.plans.findOneAsync({ _id: id, userId, status: 'active' });
    if (!plan) return res.status(404).json({ message: 'תוכנית לא נמצאה' });

    const movement = await db.movements.findOneAsync({ planId: id, day: plan.currentDay });
    if (!movement) return res.status(400).json({ message: 'תנועת היום לא נמצאה' });
    if (movement.completed) return res.status(400).json({ message: 'כבר סיימת את התנועה היום! כל הכבוד!' });

    const now = new Date().toISOString();
    await db.movements.updateAsync({ _id: movement._id }, { $set: { completed: true, completedAt: now } });

    const newCurrentDay = plan.currentDay < plan.totalDays ? plan.currentDay + 1 : plan.currentDay;
    const newStatus = plan.currentDay >= plan.totalDays ? 'completed' : 'active';

    await db.plans.updateAsync({ _id: id }, { $set: { currentDay: newCurrentDay, status: newStatus, lastActivityAt: now } });

    try {
      await db.dailyMovements.insertAsync({ userId, planId: id, day: plan.currentDay, completedAt: now });
    } catch (_) { /* duplicate */ }

    const movements = await db.movements.findAsync({ planId: id }).sort({ day: 1 });
    const completedDays = movements.filter((m) => m.completed).length;
    const isCompleted = newStatus === 'completed';

    res.json({
      message: isCompleted ? 'הגעת. כל הכבוד.' : `כל הכבוד! יום ${plan.currentDay} מסומן!`,
      plan: { ...plan, movements, currentDay: newCurrentDay, status: newStatus },
      completedDays,
      isCompleted
    });
  } catch (err) {
    console.error('Complete today error:', err);
    res.status(500).json({ message: 'שגיאה בסימון התנועה' });
  }
};

exports.getPlanMap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const plan = await db.plans.findOneAsync({ _id: id, userId });
    if (!plan) return res.status(404).json({ message: 'תוכנית לא נמצאה' });

    const movements = await db.movements.findAsync({ planId: id }).sort({ day: 1 });
    const completedDays = movements.filter((m) => m.completed).length;
    const completionPercent = Math.round((completedDays / plan.totalDays) * 100);
    const showShapeOutline = completionPercent >= 80;
    const showCountdown = completionPercent >= 85;

    const mapData = movements.map((m) => ({
      day: m.day,
      action: m.action,
      instruction: m.instruction,
      completed: m.completed,
      completedAt: m.completedAt,
      isToday: m.day === plan.currentDay,
      isFuture: m.day > plan.currentDay
    }));

    res.json({
      plan: { id: plan._id, goal: plan.goal, totalDays: plan.totalDays, currentDay: plan.currentDay, shape: plan.shape, status: plan.status },
      mapData,
      completedDays,
      completionPercent,
      showShapeOutline,
      showCountdown,
      remainingMovements: plan.totalDays - completedDays
    });
  } catch (err) {
    console.error('Get plan map error:', err);
    res.status(500).json({ message: 'שגיאה בטעינת המפה' });
  }
};

exports.abandonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const plan = await db.plans.findOneAsync({ _id: id, userId, status: 'active' });
    if (!plan) return res.status(404).json({ message: 'תוכנית לא נמצאה' });

    await db.plans.updateAsync({ _id: id }, { $set: { status: 'abandoned' } });
    res.json({ message: 'התוכנית הופסקה. אתה תמיד יכול להתחיל מחדש.' });
  } catch (err) {
    console.error('Abandon plan error:', err);
    res.status(500).json({ message: 'שגיאה בהפסקת התוכנית' });
  }
};
