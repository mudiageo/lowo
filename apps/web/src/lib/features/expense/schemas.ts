import * as v from "valibot";

export const CreateExpenseSchema = v.object({
  categoryId: v.pipe(v.string(), v.minLength(1, "Category is required")),
  amount: v.pipe(v.number(), v.minValue(1, "Amount must be greater than 0")),
  note: v.optional(v.string()),
  date: v.pipe(v.date(), v.maxValue(new Date(), "Expense date cannot be in the future")),
  paymentMethod: v.picklist(["cash", "transfer", "card", "ussd"]),
});

export type CreateExpenseInput = v.InferInput<typeof CreateExpenseSchema>;
