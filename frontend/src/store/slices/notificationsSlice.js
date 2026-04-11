import { createSlice } from "@reduxjs/toolkit";

/**
 * notificationsSlice
 *
 * Manages global in-app notification banners that can be dispatched
 * from any component in the app. Each notification has:
 *   - id       : unique identifier (auto-generated via Date.now())
 *   - message  : the text to display
 *   - type     : "success" | "error" | "info" | "warning"
 *   - timestamp: when it was added
 */
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    /** Add a new notification to the queue */
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id ?? Date.now(),
        message: action.payload.message,
        type: action.payload.type ?? "info",
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.items.unshift(notification); // newest first
      state.unreadCount += 1;
    },

    /** Mark a single notification as read */
    markAsRead: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    /** Mark all notifications as read */
    markAllAsRead: (state) => {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },

    /** Remove a specific notification by id */
    removeNotification: (state, action) => {
      const idx = state.items.findIndex((n) => n.id === action.payload);
      if (idx !== -1) {
        if (!state.items[idx].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(idx, 1);
      }
    },

    /** Clear the entire notification list */
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

/** Returns all notification items */
export const selectAllNotifications = (state) => state.notifications.items;

/** Returns the count of unread notifications */
export const selectUnreadCount = (state) => state.notifications.unreadCount;

/** Returns only unread notifications */
export const selectUnreadNotifications = (state) =>
  state.notifications.items.filter((n) => !n.read);

export default notificationsSlice.reducer;
