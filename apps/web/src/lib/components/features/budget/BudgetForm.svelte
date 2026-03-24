<script lang="ts">
  import { db } from "$lib/db";
  import { appStore } from "$lib/stores/app.svelte";
  import * as v from "valibot";
  import { CreateBudgetPeriodSchema } from "$lib/features/budget/schemas";
  import { getBudgetPeriodDates } from "$lib/features/budget/utils";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Card } from "$lib/components/ui/card";
  import Plus from "@lucide/svelte/icons/plus";
  import Save from "@lucide/svelte/icons/save";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import CalendarDays from "@lucide/svelte/icons/calendar-days";

  let { onSaveSuccess } = $props<{ onSaveSuccess: () => void }>();

  let name = $state("");
  let type = $state<"daily"| "weekly"| "biweekly"| "monthly"| "custom_days"| "calendar_anchored">("monthly");
  let customDays = $state(1);
  let anchorDay = $state(25); // default: 25th (salary day)
  let startDate = $state(new Date().toISOString().split('T')[0]);
  let totalAmount = $state("");
  let errors = $state<Record<string, string>>({});
  let isSaving = $state(false);

  // Compute end date preview
  const endDatePreview = $derived.by(() => {
    if (!startDate) return null;
    try {
      const fakePeriod = {
        id: '', name: '', startDate: new Date(startDate), periodType: type,
        customDays: Number(customDays), anchorDay: Number(anchorDay),
        currency: 'NGN' as const, totalAmount: 0, createdAt: new Date()
      };
      const { end } = getBudgetPeriodDates(fakePeriod);
      return end;
    } catch { return null; }
  });

  let categories = $state([
    { id: crypto.randomUUID(), name: "Food", color: "#EF4444", allocated: "" },
    { id: crypto.randomUUID(), name: "Transport", color: "#10B981", allocated: "" },
  ]);

  function addCategory() {
    categories.push({ id: crypto.randomUUID(), name: "New Category", color: "#3B82F6", allocated: "" });
  }

  function removeCategory(id: string) {
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) categories.splice(idx, 1);
  }

  async function save() {
    errors = {};
    const payload = {
      name,
      periodType: type,
      customDays: type === 'custom_days' ? Number(customDays) : undefined,
      anchorDay: type === 'calendar_anchored' ? Number(anchorDay) : undefined,
      startDate: new Date(startDate),
      totalAmount: Number(totalAmount)
    };

    const result = v.safeParse(CreateBudgetPeriodSchema, payload);

    if (!result.success) {
      for (const issue of result.issues) {
         if (issue.path && issue.path[0]) {
           errors[issue.path[0].key as string] = issue.message;
         }
      }
      return;
    }

    try {
      isSaving = true;
      const periodId = crypto.randomUUID();
      await db.budgetPeriods.add({
        id: periodId,
        name: result.output.name,
        periodType: result.output.periodType,
        customDays: result.output.customDays,
        anchorDay: result.output.anchorDay,
        startDate: result.output.startDate,
        currency: appStore.settings?.currency || "NGN",
        totalAmount: result.output.totalAmount,
        createdAt: new Date()
      });

      for (const cat of categories) {
        await db.budgetCategories.add({
          id: crypto.randomUUID(),
          budgetPeriodId: periodId,
          name: cat.name,
          icon: "circle",
          allocatedAmount: Number(cat.allocated) || 0,
          color: cat.color,
          isNigerianDefault: false
        });
      }

      onSaveSuccess();
    } catch (e) {
      alert("Failed to save budget period.");
    } finally {
      isSaving = false;
    }
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); save(); }} class="space-y-6">
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Budget Name</Label>
      <Input id="name" bind:value={name} placeholder="e.g. October 2026" required />
      {#if errors.name}<p class="text-xs text-destructive">{errors.name}</p>{/if}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="type">Period Type</Label>
        <select id="type" bind:value={type} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom_days">Custom Days</option>
          <option value="calendar_anchored">📅 Calendar-Anchored (Salary Day)</option>
        </select>
      </div>
      <div class="space-y-2">
        <Label for="start">Start Date</Label>
        <Input id="start" type="date" bind:value={startDate} required />
        {#if errors.startDate}<p class="text-xs text-destructive">{errors.startDate}</p>{/if}
      </div>
    </div>

    <!-- End date preview -->
    {#if endDatePreview}
      <div class="flex items-center space-x-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
        <CalendarDays class="h-4 w-4 text-primary flex-shrink-0" />
        <span class="text-muted-foreground">Budget ends on</span>
        <span class="font-medium text-foreground">{endDatePreview.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
    {/if}

    {#if type === "custom_days"}
        <div class="space-y-2">
        <Label for="customDays">Number of Days</Label>
        <Input id="customDays" type="number" min="1" max="365" bind:value={customDays} required />
        {#if errors.customDays}<p class="text-xs text-destructive">{errors.customDays}</p>{/if}
      </div>
    {/if}

    {#if type === "calendar_anchored"}
        <div class="space-y-2">
        <Label for="anchor">Anchor Day (1-28)</Label>
        <Input id="anchor" type="number" min="1" max="28" bind:value={anchorDay} required />
        <p class="text-[10px] text-muted-foreground uppercase tracking-tight">Every month starting on the {anchorDay}{anchorDay===1?'st':anchorDay===2?'nd':anchorDay===3?'rd':'th'}</p>
        {#if errors.anchorDay}<p class="text-xs text-destructive">{errors.anchorDay}</p>{/if}
      </div>
    {/if}

    <div class="space-y-2 pt-2">
      <Label for="amount">Total Expected Budget Pool</Label>
      <Input id="amount" type="number" bind:value={totalAmount} placeholder="e.g. 500000" required />
      {#if errors.totalAmount}<p class="text-xs text-destructive">{errors.totalAmount}</p>{/if}
    </div>
  </div>

  <div class="border-t border-border pt-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-heading font-bold">Categories</h3>
      <Button type="button" variant="outline" size="sm" onclick={addCategory}>
        <Plus class="w-4 h-4 mr-1" /> Add
      </Button>
    </div>

    <div class="space-y-3 max-h-[250px] overflow-y-auto pr-2">
      {#each categories as cat (cat.id)}
        <div class="flex items-center space-x-2 p-2 border border-border rounded-lg bg-muted/30">
          <input type="color" bind:value={cat.color} class="w-6 h-6 rounded border-none bg-transparent cursor-pointer p-0" />
          <Input class="flex-1 h-8 text-sm" bind:value={cat.name} placeholder="Category" />
          <Input class="w-24 h-8 text-sm" type="number" bind:value={cat.allocated} placeholder="Amount" />
          <Button type="button" variant="ghost" size="icon" onclick={() => removeCategory(cat.id)} class="text-destructive h-8 w-8">
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      {/each}
    </div>
  </div>

  <Button type="submit" class="w-full h-11" disabled={isSaving}>
    {#if isSaving} Saving... {:else} <Save class="w-4 h-4 mr-2" /> Save & Start Budget {/if}
  </Button>
</form>
