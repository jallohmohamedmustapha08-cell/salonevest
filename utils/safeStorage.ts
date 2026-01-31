"use client";

/**
 * A safe storage wrapper that falls back to in-memory storage
 * if localStorage is not available or throws a SecurityError.
 */
class SafeStorage {
    private memoryStore: Map<string, string>;
    private isLocalStorageAvailable: boolean;

    constructor() {
        this.memoryStore = new Map();
        this.isLocalStorageAvailable = this.checkLocalStorage();
    }

    private checkLocalStorage(): boolean {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }
            const testKey = '__storage_test__';
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
            console.warn('LocalStorage access denied. Falling back to memory storage.', e);
        }
    }

    getItem(key: string): string | null {
        if (this.isLocalStorageAvailable) {
            try {
                return window.localStorage.getItem(key);
            } catch (e) {
                // Fallback if random error occurs
            }
        }
        return this.memoryStore.get(key) || null;
    }

    setItem(key: string, value: string): void {
        if (this.isLocalStorageAvailable) {
            try {
                window.localStorage.setItem(key, value);
            } catch (e) {
                // Fallback
            }
        }
        this.memoryStore.set(key, value);
    }

    removeItem(key: string): void {
        if (this.isLocalStorageAvailable) {
            try {
                window.localStorage.removeItem(key);
            } catch (e) {
                // Fallback
            }
        }
        this.memoryStore.delete(key);
    }

    clear(): void {
        if (this.isLocalStorageAvailable) {
            try {
                window.localStorage.clear();
            } catch (e) {
                // Fallback
            }
        }
        this.memoryStore.clear();
    }
}

export const safeStorage = new SafeStorage();
