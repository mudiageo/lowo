<script lang="ts">
  import { db } from "$lib/db";
  import { budgetStore } from "$lib/stores/budget.svelte";
  import { appStore } from "$lib/stores/app.svelte";
  import { getBudgetPeriodDates } from "$lib/features/budget/utils";
  import { liveQuery } from "dexie";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import Plus from "@lucide/svelte/icons/plus";
  import History from "@lucide/svelte/icons/history";
  import Copy from "@lucide/svelte/icons/copy";

  const formatter = $derived(new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: appStore.settings?.currency || 'NGN',
    maximumFractionDigits: 0
  }));

</script>

<div class="space-y-6 pb-24 md:pb-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-heading font-bold tracking-tight">Budgets</h1>
      <p class="text-muted-foreground text-sm">Manage your budget periods.</p>
    </div>
    <Button href="/budgets/new">
      <Plus class="w-4 h-4 mr-2" />
      New Budget
    </Button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each budgetStore.periods as period}
      <!-- Let's calculate dates for display -->
      {@const dates = getBudgetPeriodDates(period)}
      {@const isActive = budgetStore.activePeriodId === period.id}
      <Card class="relative overflow-hidden {isActive ? 'border-primary ring-1 ring-primary/50' : ''}">
        {#if isActive}
          <div class="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
            ACTIVE
          </div>
        {/if}
        <CardHeader class="pb-2 text-balance">
          <CardTitle class="text-lg flex justify-between items-center pr-12">
            <span>{period.name}</span>
          </CardTitle>
          <p class="text-xs text-muted-foreground">
            {dates.start.toLocaleDateString()} — {dates.end.toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-mono font-bold tracking-tighter mt-2">{formatter.format(period.totalAmount)}</p>
          <div class="flex items-center space-x-2 mt-4">
            <Button variant={isActive ? "secondary" : "default"} size="sm" class="flex-1" onclick={() => budgetStore.setActivePeriod(period.id)}>
              {isActive ? 'Currently Viewing' : 'View'}
            </Button>
            <Button variant="outline" size="icon" title="Duplicate Budget">
              <Copy class="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    {:else}
      <!-- Empty state -->
      <div class="col-span-full border border-dashed border-border rounded-xl p-12 text-center bg-card/50">
        <h3 class="text-lg font-medium">No Budget Periods</h3>
        <p class="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">You haven't created any budget periods yet. Create a new one to start tracking your spending.</p>
        <Button class="mt-4" href="/budgets/new">Create Budget</Button>
      </div>
    {/each}
  </div>

  {#if budgetStore.activePeriodId}
    <div class="mt-12 flex items-center justify-between border-t border-border pt-8">
      <h2 class="text-xl font-heading font-bold">Category Allocations</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {#each budgetStore.spendingProgress.categories as catProg}
        <div class="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10" style="color: {catProg.category.color}">
              <!-- Dynamic lucide icon mapping is complex in pure SSR without bundle, placeholder for now -->
              <span class="font-bold">{catProg.category.name.charAt(0)}</span>
            </div>
            <div>
              <p class="font-medium text-sm">{catProg.category.name}</p>
              <p class="text-xs text-muted-foreground">{catProg.percentage}% spent</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-mono text-sm">{formatter.format(catProg.spent)}</p>
            <p class="font-mono text-xs text-muted-foreground">/ {formatter.format(catProg.allocated)}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}

</div>
