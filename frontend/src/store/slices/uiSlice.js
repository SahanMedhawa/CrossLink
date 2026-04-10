import { createSlice } from "@reduxjs/toolkit";

/**
 * uiSlice
 *
 * Manages global UI state shared across the app:
 *   - sidebarOpen   : Whether the navigation sidebar is expanded
 *   - globalLoading : A global loading overlay flag
 *   - theme         : "light" | "dark"
 *   - activeTab     : Tracks the currently active dashboard tab
 */
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    globalLoading: false,
    theme: "light",
    activeTab: "dashboard",
  },
  reducers: {
    /** Toggle or explicitly set the sidebar open/closed */
    setSidebarOpen: (state, action) => {
      state.sidebarOpen =
        action.payload !== undefined ? action.payload : !state.sidebarOpen;
    },

    /** Toggle the sidebar (convenience action) */
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    /** Show or hide the global loading overlay */
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },

    /** Switch between light and dark theme */
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    /** Toggle between light and dark */
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },

    /** Sets the currently active navigation tab */
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setGlobalLoading,
  setTheme,
  toggleTheme,
  setActiveTab,
} = uiSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectTheme = (state) => state.ui.theme;
export const selectActiveTab = (state) => state.ui.activeTab;

export default uiSlice.reducer;
