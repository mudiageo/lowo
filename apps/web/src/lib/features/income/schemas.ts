import * as v from 'valibot';

export const CreateIncomeSchema = v.object({
  label: v.pipe(v.string(), v.minLength(1, "Label is required")),
  amount: v.pipe(v.number(), v.minValue(1, "Amount must be greater than 0")),
  frequency: v.picklist(["one_time", "weekly", "biweekly", "monthly", "yearly", "irregular"]),
  date: v.date("Invalid date"),
});

export type CreateIncomeInput = v.InferInput<typeof CreateIncomeSchema>;
