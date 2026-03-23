import * as v from 'valibot';

export const CreateBudgetPeriodSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.minLength(1, "Name is required")),
    periodType: v.picklist(["daily", "weekly", "biweekly", "monthly", "custom_days", "calendar_anchored"]),
    customDays: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(365))),
    anchorDay: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(28))),
    startDate: v.pipe(v.date(), v.minValue(new Date(new Date().setHours(0, 0, 0, 0)), "Start date cannot be in the past")),
    totalAmount: v.pipe(v.number(), v.minValue(1, "Total amount must be greater than 0")),
  }),
  v.forward(
    v.check((input) => {
      if (input.periodType === 'custom_days' && !input.customDays) return false;
      return true;
    }, 'Custom days is required when period type is custom_days'),
    ['customDays']
  ),
  v.forward(
    v.check((input) => {
      if (input.periodType === 'calendar_anchored' && !input.anchorDay) return false;
      return true;
    }, 'Anchor day is required when period type is calendar_anchored'),
    ['anchorDay']
  )
);

export type CreateBudgetPeriodInput = v.InferInput<typeof CreateBudgetPeriodSchema>;
