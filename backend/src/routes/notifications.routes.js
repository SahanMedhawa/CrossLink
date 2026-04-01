const express = require('express');
const {
  getMyNotifications,
  readNotification,
  readAllNotifications,
  getMyUnreadCount,
} = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getMyNotifications);
router.get('/unread-count', getMyUnreadCount);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);

module.exports = router;
