import Dexie, { type Table } from 'dexie';

export interface BudgetPeriod {
  id: string; // cuid or uuid
  name: string;
  periodType: "daily" | "weekly" | "biweekly" | "monthly" | "custom_days" | "calendar_anchored";
  customDays?: number; // used when periodType = "custom_days"
  anchorDay?: number;  // 1-28, used when periodType = "calendar_anchored"
  startDate: Date;
  currency: "NGN" | "USD";
  totalAmount: number;
  createdAt: Date;
}

export interface BudgetCategory {
  id: string;
  budgetPeriodId: string;
  name: string;
  icon: string; // lucide icon name
  allocatedAmount: number;
  color: string; // hex
  isNigerianDefault: boolean; // true for seeded NG categories
}

export interface Expense {
  id: string;
  categoryId: string;
  budgetPeriodId: string;
  amount: number;
  note?: string;
  date: Date;
  paymentMethod: "cash" | "transfer" | "card" | "ussd";
  createdAt: Date;
}

export interface Income {
  id: string;
  label: string;
  amount: number;
  frequency: "one_time" | "weekly" | "biweekly" | "monthly" | "irregular";
  date: Date;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: Date;
  icon: string;
  color: string;
  createdAt: Date;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface AIInsight {
  id: string;
  generatedAt: Date;
  budgetPeriodId: string;
  type: "spending_analysis" | "savings_coach" | "bill_prediction" | "personality";
  content: string; // JSON string of structured insight
  model: string; // e.g. "gemini-2.5-flash"
}

export interface AppSettings {
  id: "singleton";
  currency: "NGN" | "USD";
  userName: string;
  onboardingComplete: boolean;
  pinEnabled: boolean;
  pinHash?: string;
  theme: "light" | "dark" | "system";
  aiEnabled: boolean;
  geminiApiKey?: string; // user provides own key
}
