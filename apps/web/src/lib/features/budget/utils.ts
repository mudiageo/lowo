import type { BudgetPeriod, BudgetCategory, Expense } from "../../db/schema";

export function getBudgetPeriodDates(period: BudgetPeriod): { start: Date; end: Date } {
  const start = new Date(period.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  switch (period.periodType) {
    case "daily":
      end.setDate(start.getDate() + 1);
      break;
    case "weekly":
      end.setDate(start.getDate() + 7);
      break;
    case "biweekly":
      end.setDate(start.getDate() + 14);
      break;
    case "monthly":
      end.setMonth(start.getMonth() + 1);
      end.setDate(1); // Set to first day of next month
      break;
    case "custom_days":
      end.setDate(start.getDate() + (period.customDays || 1));
      break;
    case "calendar_anchored":
      const anchor = period.anchorDay || 1;
      end.setMonth(start.getMonth() + 1);
      end.setDate(anchor);
      break;
  }

  // Subtract 1 ms to make it inclusive of the last day at 23:59:59.999
  end.setTime(end.getTime() - 1);

  return { start, end };
}

export function getCurrentActivePeriod(periods: BudgetPeriod[]): BudgetPeriod | null {
  const now = new Date();

  for (const period of periods) {
    const { start, end } = getBudgetPeriodDates(period);
    if (now >= start && now <= end) {
      return period;
    }
  }

  return null;
}

export interface CategoryProgress {
  category: BudgetCategory;
  spent: number;
  allocated: number;
  percentage: number;
}

export function getSpendingProgress(
  period: BudgetPeriod,
  categories: BudgetCategory[],
  expenses: Expense[],
): { categories: CategoryProgress[]; totalBudget: number; totalSpent: number; percentage: number } {
  const result: CategoryProgress[] = categories.map((cat) => ({
    category: cat,
    spent: 0,
    allocated: cat.allocatedAmount,
    percentage: 0,
  }));

  let totalSpent = 0;

  for (const exp of expenses) {
    const catProg = result.find((c) => c.category.id === exp.categoryId);
    if (catProg) {
      catProg.spent += exp.amount;
      totalSpent += exp.amount;
    }
  }

  for (const catProg of result) {
    if (catProg.allocated > 0) {
      catProg.percentage = Math.min(100, Math.round((catProg.spent / catProg.allocated) * 100));
    }
  }

  const totalBudget = period.totalAmount;
  const percentage =
    totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return {
    categories: result,
    totalBudget,
    totalSpent,
    percentage,
  };
}
