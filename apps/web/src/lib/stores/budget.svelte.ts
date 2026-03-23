import { db } from '../db';
import type { BudgetPeriod, BudgetCategory, Expense } from '../db/schema';
import { liveQuery } from 'dexie';
import { getBudgetPeriodDates, getCurrentActivePeriod, getSpendingProgress, type CategoryProgress } from '../features/budget/utils';

export class BudgetStore {
  periods: BudgetPeriod[] = $state([]);
  activePeriodId: string | null = $state(null);
  categories: BudgetCategory[] = $state([]);
  expenses: Expense[] = $state([]);

  constructor() {
    this.init();
  }

  async init() {
    // Subscribe to periods
    liveQuery(() => db.budgetPeriods.orderBy('startDate').reverse().toArray()).subscribe((periods) => {
      this.periods = periods;
      if (!this.activePeriodId && periods.length > 0) {
        const active = getCurrentActivePeriod(periods);
        this.activePeriodId = active ? active.id : periods[0].id; // default to most recent
      }
    });

    // We can't use liveQuery directly on activePeriodId since it's state, 
    // so we'll use an effect in components to reactively load categories/expenses
    // but we can also set up a standard svelte action for it.
  }

  // Derive the actual active period object
  get activePeriod(): BudgetPeriod | null {
    return this.periods.find(p => p.id === this.activePeriodId) || null;
  }

  // Effect method to be called when activePeriodId changes to load related data
  async loadActivePeriodData() {
    if (!this.activePeriodId) return;
    
    // Subscribe to categories and expenses for active period
    liveQuery(() => db.budgetCategories.where('budgetPeriodId').equals(this.activePeriodId!).toArray()).subscribe(cats => {
      this.categories = cats;
    });

    liveQuery(() => db.expenses.where('budgetPeriodId').equals(this.activePeriodId!).toArray()).subscribe(exps => {
      this.expenses = exps;
    });
  }

  // Derive progress
  get spendingProgress(): { categories: CategoryProgress[], totalBudget: number, totalSpent: number, percentage: number } {
    if (!this.activePeriod) return { categories: [], totalBudget: 0, totalSpent: 0, percentage: 0 };
    return getSpendingProgress(this.activePeriod, this.categories, this.expenses);
  }
  
  setActivePeriod(id: string) {
    this.activePeriodId = id;
    this.loadActivePeriodData();
  }
}

export const budgetStore = new BudgetStore();
