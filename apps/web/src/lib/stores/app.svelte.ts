import { db } from "../db";
import type { AppSettings, BudgetPeriod } from "../db/schema";
import { liveQuery } from "dexie";
import { setMode } from "mode-watcher";

export class AppStore {
  settings: AppSettings | null = $state(null);
  activePeriod: BudgetPeriod | null = $state(null);
  isOnline: boolean = $state(true);
  initialized: boolean = $state(false);
  showQuickAdd: boolean = $state(false);
  showQuickAddIncome: boolean = $state(false);

  constructor() {
    this.init();
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;
      window.addEventListener("online", () => (this.isOnline = true));
      window.addEventListener("offline", () => (this.isOnline = false));
    }
  }

  async init() {
    // Load initial settings
    const settings = await db.appSettings.get("singleton");
    if (settings) {
      this.settings = settings;
      if (settings.theme) {
        setMode(settings.theme as any);
      }
    } else {
      // Defaults
      this.settings = {
        id: "singleton",
        currency: "NGN",
        userName: "",
        onboardingComplete: false,
        pinEnabled: false,
        theme: "system",
        aiEnabled: false,
      };
      await db.appSettings.put(this.settings);
      setMode("system");
    }

    // Subscribe to settings changes
    liveQuery(() => db.appSettings.get("singleton")).subscribe((s) => {
      if (s) {
        this.settings = s;
        if (s.theme) setMode(s.theme as any);
      }
    });

    this.initialized = true;
  }

  async updateSettings(updates: Partial<AppSettings>) {
    if (!this.settings) return;
    const newSettings = { ...this.settings, ...updates };
    this.settings = newSettings; // Update local state immediately to avoid race conditions
    await db.appSettings.put(newSettings);

    if (updates.theme) {
      setMode(updates.theme as any);
    }
  }
}

export const appStore = new AppStore();
