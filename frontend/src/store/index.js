import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./slices/notificationsSlice";
import uiReducer from "./slices/uiSlice";

/**
 * CrossLink Redux Store
 *
 * Combines all feature slices into a single store.
 * Authentication state is intentionally kept in React Context (AuthContext)
 * since it integrates directly with localStorage and Firebase session handling.
 *
 * Slices managed here:
 *   - notifications : Global in-app notification queue
 *   - ui            : Global UI state (sidebar, loading overlay, theme)
 */
const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  // Redux DevTools are enabled automatically in development
  devTools: import.meta.env.DEV,
});

export default store;
