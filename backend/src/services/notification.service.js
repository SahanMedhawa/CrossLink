const Notification = require('../models/notification.model');
const { emitNotificationEvent } = require('../socket/socket.service');

const toClientNotification = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc;
  return {
    _id: String(item._id),
    recipient: String(item.recipient),
    recipientRole: item.recipientRole,
    actor: item.actor ? String(item.actor) : null,
    actorRole: item.actorRole || null,
    type: item.type,
    uniqueKey: item.uniqueKey || '',
    title: item.title,
    message: item.message,
    link: item.link || '',
    metadata: item.metadata || {},
    isRead: Boolean(item.isRead),
    readAt: item.readAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const deriveUniqueKey = (payload) => {
  if (payload.uniqueKey && typeof payload.uniqueKey === 'string') {
    return payload.uniqueKey;
  }

  const metadata = payload.metadata || {};
  const entityId =
    metadata.participationId ||
    metadata.proposalId ||
    metadata.fundingId ||
    metadata.resourceId ||
    metadata.projectId ||
    '';

  const actor = payload.actor ? String(payload.actor) : 'system';
  const status = metadata.status || '';
  return [payload.type, actor, entityId, status].filter(Boolean).join(':');
};

const createNotification = async (payload) => {
  const normalizedPayload = {
    ...payload,
    uniqueKey: deriveUniqueKey(payload),
  };

  let notification;

  if (normalizedPayload.uniqueKey) {
    notification = await Notification.findOneAndUpdate(
      {
        recipient: normalizedPayload.recipient,
        uniqueKey: normalizedPayload.uniqueKey,
        isRead: false,
      },
      {
        $set: {
          recipientRole: normalizedPayload.recipientRole,
          actor: normalizedPayload.actor || null,
          actorRole: normalizedPayload.actorRole || null,
          type: normalizedPayload.type,
          title: normalizedPayload.title,
          message: normalizedPayload.message,
          link: normalizedPayload.link || '',
          metadata: normalizedPayload.metadata || {},
          readAt: null,
        },
      },
      { new: true }
    );
  }

  if (!notification) {
    notification = await Notification.create(normalizedPayload);
  }

  const serialized = toClientNotification(notification);
  emitNotificationEvent(notification.recipient, serialized);
  return serialized;
};

const createNotifications = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const inserted = await Notification.insertMany(items, { ordered: false });
  const serialized = inserted.map(toClientNotification);
  serialized.forEach((item) => {
    emitNotificationEvent(item.recipient, item);
  });

  return serialized;
};

const listNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const query = { recipient: userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    data: notifications.map(toClientNotification),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    },
    unreadCount,
  };
};

const markNotificationRead = async (userId, notificationId) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    { new: true }
  );

  if (!updated) {
    return null;
  }

  return toClientNotification(updated);
};

const markAllNotificationsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result.modifiedCount || 0;
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

module.exports = {
  createNotification,
  createNotifications,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
};
