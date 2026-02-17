/**
 * Storage Manager
 * Handles export and import of all localStorage data
 */

export interface StorageExport {
  version: string;
  exportDate: string;
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

const STORAGE_VERSION = "1.0.0";

// Known localStorage keys used by the application
const KNOWN_KEYS = [
  "learning_agent_sessions",
  "teacher_sessions",
  "dev_prompt_config",
];

export class StorageManager {
  /**
   * Export all localStorage data as JSON
   */
  static exportAll(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: { [key: string]: any } = {};

    // Export all known keys
    for (const key of KNOWN_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    }

    // Also export any session-specific keys (advisor and teacher agent data)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("learning_agent_") ||
          key.startsWith("teacher_agent_") ||
          key.startsWith("advisor_state_") ||
          key.startsWith("teacher_state_"))
      ) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
    }

    const exportData: StorageExport = {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      data,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import localStorage data from JSON
   * Returns true if successful, false otherwise
   */
  static importAll(
    jsonString: string,
    options?: { merge?: boolean },
  ): { success: boolean; error?: string; keysImported?: number } {
    try {
      const importData: StorageExport = JSON.parse(jsonString);

      // Validate structure
      if (!importData.version || !importData.data) {
        return {
          success: false,
          error: "Invalid export file format",
        };
      }

      // Version check (for future compatibility)
      if (importData.version !== STORAGE_VERSION) {
        console.warn(
          `Import version ${importData.version} differs from current ${STORAGE_VERSION}`,
        );
      }

      let keysImported = 0;

      // Clear existing data if not merging
      if (!options?.merge) {
        this.clearAll();
      }

      // Import all data
      for (const [key, value] of Object.entries(importData.data)) {
        try {
          const jsonValue =
            typeof value === "string" ? value : JSON.stringify(value);
          localStorage.setItem(key, jsonValue);
          keysImported++;
        } catch (error) {
          console.error(`Failed to import key ${key}:`, error);
        }
      }

      return {
        success: true,
        keysImported,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Clear all application localStorage data
   */
  static clearAll(): void {
    // Clear known keys
    for (const key of KNOWN_KEYS) {
      localStorage.removeItem(key);
    }

    // Clear all session-specific keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("learning_agent_") ||
          key.startsWith("teacher_agent_") ||
          key.startsWith("advisor_state_") ||
          key.startsWith("teacher_state_"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Get summary of current localStorage usage
   */
  static getSummary(): {
    totalKeys: number;
    advisorSessions: number;
    teacherSessions: number;
    hasPromptConfig: boolean;
    storageSize: number;
  } {
    let advisorSessions = 0;
    let teacherSessions = 0;
    let storageSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          storageSize += value.length;
        }

        if (
          key.startsWith("learning_agent_") ||
          key.startsWith("advisor_state_")
        )
          advisorSessions++;
        if (
          key.startsWith("teacher_agent_") ||
          key.startsWith("teacher_state_")
        )
          teacherSessions++;
      }
    }

    // Check for sessions in the registry
    try {
      const sessionsData = localStorage.getItem("learning_agent_sessions");
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        advisorSessions = Math.max(
          advisorSessions,
          Array.isArray(sessions) ? sessions.length : 0,
        );
      }
    } catch {}

    try {
      const teacherData = localStorage.getItem("teacher_sessions");
      if (teacherData) {
        const sessions = JSON.parse(teacherData);
        teacherSessions = Math.max(
          teacherSessions,
          Array.isArray(sessions) ? sessions.length : 0,
        );
      }
    } catch {}

    return {
      totalKeys: localStorage.length,
      advisorSessions,
      teacherSessions,
      hasPromptConfig: localStorage.getItem("dev_prompt_config") !== null,
      storageSize,
    };
  }
}
