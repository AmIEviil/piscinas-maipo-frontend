/**
 * Utility class for comprehensive storage cleanup
 */
export class StorageUtils {
  /**
   * Clear all application-related storage
   * This includes localStorage, sessionStorage, and any cached data
   */
  static clearAllStorage(): void {
    try {
      // Clear bound store state first
      this.clearBoundStoreState();

      // Clear localStorage items
      const localStorageKeys = [
        "token",
        "bound-store",
        "userData",
        "refreshToken",
        "accessToken",
        "esri-token-cache",
        "esri-credentials-cache",
        "esri-token-timestamp",
        "session-timeout",
        "inactive-modal",
        "user-preferences",
        "form-data",
        "draft-data",
        "cached-responses",
      ];

      localStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear any other cached data
      this.clearIndexedDB();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  /**
   * Clear only authentication-related storage
   */
  static clearAuthStorage(): void {
    try {
      // Clear bound store state first
      this.clearBoundStoreState();

      const authKeys = [
        "token",
        "bound-store",
        "userData",
        "refreshToken",
        "accessToken",
        "esri-token-cache",
        "esri-credentials-cache",
        "esri-token-timestamp",
      ];

      authKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error clearing auth storage:", error);
    }
  }

  /**
   * Clear bound store state by resetting all slices to their initial state
   */
  static clearBoundStoreState(): void {
    try {
      // Clear the bound-store from localStorage
      localStorage.removeItem("bound-store");

      // Note: The bound store state will be automatically reset to initial values
      // when the component re-renders after localStorage is cleared
    } catch (error) {
      console.error("Error clearing bound store state:", error);
    }
  }

  /**
   * Clear only the bound store token from localStorage
   * This is useful for immediate token cleanup without full logout
   */
  static clearBoundStoreToken(): void {
    try {
      const boundStore = localStorage.getItem("bound-store");
      if (boundStore) {
        const parsedData = JSON.parse(boundStore);
        if (parsedData.state) {
          // Clear the token from the bound store state
          parsedData.state.token = undefined;
          parsedData.state.userData = undefined;
          parsedData.state.id_user = undefined;
          parsedData.state.email = undefined;
          parsedData.state.area = undefined;
          parsedData.state.role = undefined;
          parsedData.state.user_name = undefined;

          // Save the updated state back to localStorage
          localStorage.setItem("bound-store", JSON.stringify(parsedData));
        }
      }
    } catch (error) {
      console.error("Error clearing bound store token:", error);
    }
  }

  /**
   * Clear IndexedDB if it exists
   */
  private static clearIndexedDB(): void {
    try {
      if ("indexedDB" in window) {
        // Clear any IndexedDB databases if they exist
        // This is a basic implementation - you might need to adjust based on your specific IndexedDB usage
        const databases = ["app-cache", "offline-data", "user-cache"];
        databases.forEach((dbName) => {
          try {
            indexedDB.deleteDatabase(dbName);
          } catch (error) {
            console.warn(`Error deleting IndexedDB database ${dbName}:`, error);
            // Database might not exist, ignore error
          }
        });
      }
    } catch (error) {
      console.warn("Error clearing IndexedDB:", error);
    }
  }

  /**
   * Clear specific storage by pattern
   * @param pattern - Regex pattern to match storage keys
   */
  static clearStorageByPattern(pattern: RegExp): void {
    try {
      // Clear localStorage
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach((key) => {
        if (pattern.test(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach((key) => {
        if (pattern.test(key)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing storage by pattern:", error);
    }
  }
}
