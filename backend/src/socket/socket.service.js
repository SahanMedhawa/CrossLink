const { Server } = require('socket.io');
const { verifyToken } = require('../middleware/auth.middleware');

let ioInstance = null;

const normalizeId = (value) => {
  if (!value) return null;
  return String(value);
};

const resolveAllowedOrigins = () => {
  const rawOrigins = process.env.FRONTEND_URL;
  if (!rawOrigins) {
    return true;
  }

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const initSocket = (httpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: resolveAllowedOrigins(),
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token;
      const headerToken = socket.handshake.headers?.authorization;
      const rawToken = authToken || headerToken;

      if (!rawToken) {
        return next(new Error('Unauthorized'));
      }

      const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
      socket.user = verifyToken(token);
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = normalizeId(socket.user?.id);
    const userType = socket.user?.userType;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (userType) {
      socket.join(`role:${userType}`);
    }

    socket.on('join:project', (projectId) => {
      const normalizedProjectId = normalizeId(projectId);
      if (normalizedProjectId) {
        socket.join(`project:${normalizedProjectId}`);
      }
    });

    socket.on('leave:project', (projectId) => {
      const normalizedProjectId = normalizeId(projectId);
      if (normalizedProjectId) {
        socket.leave(`project:${normalizedProjectId}`);
      }
    });
  });

  return ioInstance;
};

const getIO = () => ioInstance;

const emitProjectEvent = (payload) => {
  if (!ioInstance) return;

  ioInstance.emit('project:updated', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
};

const emitParticipationEvent = (payload) => {
  if (!ioInstance) return;

  const eventPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  const ngoId = normalizeId(payload.ngoId);
  const volunteerId = normalizeId(payload.volunteerId);
  const projectId = normalizeId(payload.projectId);

  const rooms = new Set();
  if (ngoId) rooms.add(`user:${ngoId}`);
  if (volunteerId) rooms.add(`user:${volunteerId}`);
  if (projectId) rooms.add(`project:${projectId}`);

  if (rooms.size === 0) {
    ioInstance.emit('participation:updated', eventPayload);
    return;
  }

  rooms.forEach((room) => {
    ioInstance.to(room).emit('participation:updated', eventPayload);
  });
};

const emitNotificationEvent = (recipientUserId, payload) => {
  if (!ioInstance || !recipientUserId) return;

  ioInstance.to(`user:${normalizeId(recipientUserId)}`).emit('notification:new', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  initSocket,
  getIO,
  emitProjectEvent,
  emitParticipationEvent,
  emitNotificationEvent,
};
