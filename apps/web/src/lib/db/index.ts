import Dexie, { type Table } from "dexie";
import type {
  BudgetPeriod,
  BudgetCategory,
  Expense,
  Income,
  SavingsGoal,
  SavingsContribution,
  AIInsight,
  AppSettings,
} from "./schema";

export class LowoDB extends Dexie {
  budgetPeriods!: Table<BudgetPeriod, string>;
  budgetCategories!: Table<BudgetCategory, string>;
  expenses!: Table<Expense, string>;
  incomes!: Table<Income, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  savingsContributions!: Table<SavingsContribution, string>;
  aiInsights!: Table<AIInsight, string>;
  appSettings!: Table<AppSettings, string>;

  constructor() {
    super("LowoDB");
    this.version(1).stores({
      budgetPeriods: "id, startDate, periodType",
      budgetCategories: "id, budgetPeriodId, isNigerianDefault",
      expenses: "id, budgetPeriodId, categoryId, date",
      incomes: "id, date, frequency",
      savingsGoals: "id, targetDate",
      savingsContributions: "id, goalId, date",
      aiInsights: "id, budgetPeriodId, type",
      appSettings: "id",
    });
    // v2: biometric fields added to appSettings (no structural change needed — IndexedDB is schemaless)
    this.version(2).stores({
      budgetPeriods: "id, startDate, periodType",
      budgetCategories: "id, budgetPeriodId, isNigerianDefault",
      expenses: "id, budgetPeriodId, categoryId, date",
      incomes: "id, date, frequency",
      savingsGoals: "id, targetDate",
      savingsContributions: "id, goalId, date",
      aiInsights: "id, budgetPeriodId, type, createdAt",
      appSettings: "id",
    });
  }
}

export const db = new LowoDB();
