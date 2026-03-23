<script lang="ts">
  import { goto } from "$app/navigation";
  import { db } from "$lib/db";
  import { appStore } from "$lib/stores/app.svelte";
  import * as v from "valibot";
  import { CreateBudgetPeriodSchema } from "$lib/features/budget/schemas";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Plus from "@lucide/svelte/icons/plus";
  import Save from "@lucide/svelte/icons/save";
  import Trash2 from "@lucide/svelte/icons/trash-2";

  let name = $state("");
  let type = $state<"daily"| "weekly"| "biweekly"| "monthly"| "custom_days"| "calendar_anchored">("monthly");
  let customDays = $state(1);
  let anchorDay = $state(1);
  let startDate = $state(new Date().toISOString().split('T')[0]);
  let totalAmount = $state("");
  let errors = $state<Record<string, string>>({});

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
          icon: "circle", // default
          allocatedAmount: Number(cat.allocated) || 0,
          color: cat.color,
          isNigerianDefault: false
        });
      }

      goto("/budgets");
    } catch (e) {
      alert("Failed to save budget period.");
    }
  }

</script>

<div class="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
  
  <div class="flex items-center space-x-4">
    <Button variant="ghost" size="icon" href="/budgets">
      <ArrowLeft class="w-5 h-5" />
    </Button>
    <div>
      <h1 class="text-2xl font-heading font-bold tracking-tight">New Budget Period</h1>
    </div>
  </div>

  <form onsubmit={(e) => { e.preventDefault(); save(); }}>
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <CardDescription>Set up the timeframe and overall pool for this period.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Budget Name</Label>
          <Input id="name" bind:value={name} placeholder="e.g. October 2026" />
          {#if errors.name}<p class="text-xs text-destructive">{errors.name}</p>{/if}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="type">Period Type</Label>
            <select id="type" bind:value={type} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom_days">Custom Days</option>
              <option value="calendar_anchored">Calendar Anchored</option>
            </select>
          </div>
          <div class="space-y-2">
            <Label for="start">Start Date</Label>
            <Input id="start" type="date" bind:value={startDate} />
            {#if errors.startDate}<p class="text-xs text-destructive">{errors.startDate}</p>{/if}
          </div>
        </div>

        {#if type === "custom_days"}
           <div class="space-y-2">
            <Label for="customDays">Number of Days</Label>
            <Input id="customDays" type="number" min="1" max="365" bind:value={customDays} />
            {#if errors.customDays}<p class="text-xs text-destructive">{errors.customDays}</p>{/if}
          </div>
        {/if}

        {#if type === "calendar_anchored"}
           <div class="space-y-2">
            <Label for="anchor">Anchor Day (1-28)</Label>
            <Input id="anchor" type="number" min="1" max="28" bind:value={anchorDay} />
            <p class="text-xs text-muted-foreground">Every month starting on the {anchorDay}{anchorDay===1?'st':anchorDay===2?'nd':anchorDay===3?'rd':'th'} (e.g. Salary day)</p>
            {#if errors.anchorDay}<p class="text-xs text-destructive">{errors.anchorDay}</p>{/if}
          </div>
        {/if}

        <div class="space-y-2 pt-2">
          <Label for="amount">Total Expected Budget Pool</Label>
          <Input id="amount" type="number" bind:value={totalAmount} placeholder="e.g. 500000" />
          {#if errors.totalAmount}<p class="text-xs text-destructive">{errors.totalAmount}</p>{/if}
        </div>
      </CardContent>
    </Card>

    <div class="flex items-center justify-between mt-8 mb-4">
      <h2 class="text-xl font-heading font-bold">Categories</h2>
      <Button type="button" variant="outline" size="sm" onclick={addCategory}>
        <Plus class="w-4 h-4 mr-2" />
        Add Category
      </Button>
    </div>

    <div class="space-y-3">
      {#each categories as cat (cat.id)}
        <Card class="p-3">
          <div class="flex items-center space-x-3">
            <input type="color" bind:value={cat.color} class="w-8 h-8 rounded border-none bg-transparent cursor-pointer p-0" />
            <Input class="flex-1" bind:value={cat.name} placeholder="Category Name" />
            <Input class="flex-1" type="number" bind:value={cat.allocated} placeholder="Allocated Amount" />
            <Button type="button" variant="ghost" size="icon" onclick={() => removeCategory(cat.id)} class="text-destructive">
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </Card>
      {/each}
    </div>

    <div class="mt-8">
      <Button type="submit" class="w-full h-12 text-md">
        <Save class="w-5 h-5 mr-2" />
        Save & Start Budget
      </Button>
    </div>

  </form>
</div>
