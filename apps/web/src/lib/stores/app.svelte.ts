import { db } from '../db';
import type { AppSettings, BudgetPeriod } from '../db/schema';
import { liveQuery } from 'dexie';

export class AppStore {
  settings: AppSettings | null = $state(null);
  activePeriod: BudgetPeriod | null = $state(null);
  isOnline: boolean = $state(true);
  initialized: boolean = $state(false);
  showQuickAdd: boolean = $state(false);
  showQuickAddIncome: boolean = $state(false);

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => (this.isOnline = true));
      window.addEventListener('offline', () => (this.isOnline = false));
    }
  }

  async init() {
    // Load initial settings
    const settings = await db.appSettings.get("singleton");
    if (settings) {
      this.settings = settings;
    } else {
      // Defaults
      this.settings = {
        id: "singleton",
        currency: "NGN",
        userName: "",
        onboardingComplete: false,
        pinEnabled: false,
        theme: "system",
        aiEnabled: false
      };
      await db.appSettings.put(this.settings);
    }

    // Subscribe to settings changes
    liveQuery(() => db.appSettings.get("singleton")).subscribe((s) => {
      if (s) this.settings = s;
    });

    this.initialized = true;
  }

  async updateSettings(updates: Partial<AppSettings>) {
    if (!this.settings) return;
    const newSettings = { ...this.settings, ...updates };
    await db.appSettings.put(newSettings);
  }
}

export const appStore = new AppStore();
