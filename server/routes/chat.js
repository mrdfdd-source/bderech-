const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/message', chatController.sendMessage);
router.post('/movement-help', chatController.movementHelp);
router.post('/clear', chatController.clearSession);

module.exports = router;
