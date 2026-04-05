const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} = require('../services/notification.service');

const getMyNotifications = async (req, res) => {
  try {
    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';
    const result = await listNotifications(req.user.id, {
      page: req.query.page,
      limit: req.query.limit,
      unreadOnly,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
      error: error.message,
    });
  }
};

const readNotification = async (req, res) => {
  try {
    const updated = await markNotificationRead(req.user.id, req.params.id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message,
    });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    const modifiedCount = await markAllNotificationsRead(req.user.id);

    return res.status(200).json({
      success: true,
      modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notifications.',
      error: error.message,
    });
  }
};

const getMyUnreadCount = async (req, res) => {
  try {
    const unreadCount = await getUnreadCount(req.user.id);

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count.',
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  readNotification,
  readAllNotifications,
  getMyUnreadCount,
};
