const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/create', planController.createPlan);
router.get('/current', planController.getCurrentPlan);
router.post('/:id/complete-today', planController.completeToday);
router.get('/:id/map', planController.getPlanMap);
router.post('/:id/abandon', planController.abandonPlan);

module.exports = router;
