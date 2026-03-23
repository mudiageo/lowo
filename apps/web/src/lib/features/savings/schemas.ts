import * as v from 'valibot';

export const CreateSavingsGoalSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, "Goal name is required")),
  targetAmount: v.pipe(v.number(), v.minValue(1, "Target amount must be greater than 0")),
  targetDate: v.optional(
    v.pipe(v.date(), v.minValue(new Date(new Date().setHours(0, 0, 0, 0)), "Target date must be in the future"))
  ),
  icon: v.string(),
  color: v.string(),
});

export type CreateSavingsGoalInput = v.InferInput<typeof CreateSavingsGoalSchema>;

export const CreateSavingsContributionSchema = v.object({
  amount: v.pipe(v.number(), v.minValue(1, "Amount must be greater than 0")),
  date: v.date("Invalid date"),
  note: v.optional(v.string()),
});

export type CreateSavingsContributionInput = v.InferInput<typeof CreateSavingsContributionSchema>;
