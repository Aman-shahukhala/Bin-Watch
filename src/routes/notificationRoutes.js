const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/subscribe', notificationController.subscribe);
router.post('/test', notificationController.sendTestNotification);

module.exports = router;
