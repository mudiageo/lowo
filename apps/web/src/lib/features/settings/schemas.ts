import * as v from "valibot";

export const AppSettingsSchema = v.object({
  currency: v.picklist(["NGN", "USD"]),
  userName: v.pipe(v.string(), v.minLength(1, "Name is required")),
  onboardingComplete: v.boolean(),
  pinEnabled: v.boolean(),
  pinHash: v.optional(v.string()),
  theme: v.picklist(["light", "dark", "system"]),
  aiEnabled: v.boolean(),
  geminiApiKey: v.optional(v.string()),
});

export const PartialAppSettingsSchema = v.partial(AppSettingsSchema);

export type AppSettingsInput = v.InferInput<typeof AppSettingsSchema>;
export type PartialAppSettingsInput = v.InferInput<typeof PartialAppSettingsSchema>;
