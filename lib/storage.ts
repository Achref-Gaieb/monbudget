/**
 * Storage abstraction layer.
 *
 * The Zustand store persists through this adapter instead of touching
 * localStorage directly. Swapping to a remote backend (Supabase, Firebase,
 * PostgreSQL API…) later only requires providing another StorageAdapter —
 * no change anywhere else in the app. Data versioning itself is handled by
 * the store's `version` + `migrate` (zustand/persist).
 */
export interface StorageAdapter {
  getItem(name: string): string | null | Promise<string | null>;
  setItem(name: string, value: string): void | Promise<void>;
  removeItem(name: string): void | Promise<void>;
}

const BACKUP_SUFFIX = "::backup";
const BACKUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * LocalStorage adapter with a rolling safety backup: at most every
 * 5 minutes, the previous value is copied aside before being overwritten,
 * so a corrupted write never destroys the only copy of the user's data.
 */
class LocalStorageAdapter implements StorageAdapter {
  private lastBackupAt = 0;

  getItem(name: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(name);
  }

  setItem(name: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      const now = Date.now();
      if (now - this.lastBackupAt > BACKUP_INTERVAL_MS) {
        const previous = window.localStorage.getItem(name);
        if (previous !== null) {
          window.localStorage.setItem(name + BACKUP_SUFFIX, previous);
        }
        this.lastBackupAt = now;
      }
    } catch {
      // Backup is best-effort; never block the main write.
    }
    window.localStorage.setItem(name, value);
  }

  removeItem(name: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
    window.localStorage.removeItem(name + BACKUP_SUFFIX);
  }
}

export const storageAdapter: StorageAdapter = new LocalStorageAdapter();

/** Reads the last rolling backup, if any (recovery utility). */
export function readBackup(name: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(name + BACKUP_SUFFIX);
}
