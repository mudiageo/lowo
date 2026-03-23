<script lang="ts">
  import { appStore } from "$lib/stores/app.svelte";
  import { budgetStore } from "$lib/stores/budget.svelte";
  import { getBudgetPeriodDates } from "$lib/features/budget/utils";
  import { db } from "$lib/db";
  import { liveQuery } from "dexie";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import Plus from "@lucide/svelte/icons/plus";
  import Wallet from "@lucide/svelte/icons/wallet";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { Button } from "$lib/components/ui/button";
  import type { Expense, Income, SavingsGoal } from "$lib/db/schema";

  // Subscribe to incomes and savings goals for current period context
  let incomes = $state<Income[]>([]);
  let savingsGoals = $state<SavingsGoal[]>([]);
  let recentExpenses = $state<Expense[]>([]);

  $effect(() => {
    // Get recent 5 expenses globally or for this period
    const subE = liveQuery(() => 
      db.expenses.orderBy('date').reverse().limit(5).toArray()
    ).subscribe(v => recentExpenses = v);

    const subI = liveQuery(() => 
       db.incomes.toArray()
    ).subscribe(v => incomes = v);

    const subS = liveQuery(() => 
       db.savingsGoals.toArray()
    ).subscribe(v => savingsGoals = v);

    return () => { subE.unsubscribe(); subI.unsubscribe(); subS.unsubscribe(); };
  });

  const formatter = $derived(new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: appStore.settings?.currency || 'NGN',
    maximumFractionDigits: 0
  }));

  const activePeriodInfo = $derived.by(() => {
    const p = budgetStore.activePeriod;
    if (!p) return null;
    const dates = getBudgetPeriodDates(p);
    
    // Days remaining
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.max(0, Math.ceil((dates.end.getTime() - now.getTime()) / msPerDay));
    
    return { ...p, dates, daysRemaining };
  });

  const prog = $derived(budgetStore.spendingProgress);

</script>

<div class="space-y-6 pb-24 md:pb-6">
  
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-heading font-bold tracking-tight">
        Hello, {appStore.settings?.userName || "there"} 👋
      </h1>
      <p class="text-muted-foreground text-sm">Here's your financial summary.</p>
    </div>
  </div>

  {#if !activePeriodInfo}
    <Card class="bg-primary/5 border-primary/20">
      <CardContent class="p-6 text-center space-y-4">
        <h3 class="font-medium">No Active Budget</h3>
        <p class="text-sm text-muted-foreground">You don't have a budget period active for today.</p>
        <Button href="/budgets">Create Budget</Button>
      </CardContent>
    </Card>
  {:else}
    <!-- Main Overview Card -->
    <Card class="bg-gradient-to-br from-card to-card/50 border-border overflow-hidden relative">
      <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Wallet class="w-32 h-32" />
      </div>
      <CardContent class="p-6 relative z-10">
        <div class="flex justify-between items-start mb-6">
          <div>
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary mb-2">
              {activePeriodInfo.name}
            </div>
            <p class="text-sm text-muted-foreground">
              {activePeriodInfo.dates.start.toLocaleDateString()} - {activePeriodInfo.dates.end.toLocaleDateString()}
            </p>
          </div>
          <div class="text-right">
            <span class="text-sm font-medium text-muted-foreground">{activePeriodInfo.daysRemaining} days left</span>
          </div>
        </div>

        <div class="mt-4">
          <p class="text-sm text-muted-foreground font-medium mb-1">Total Spent</p>
          <div class="flex items-baseline space-x-2">
            <h2 class="text-4xl font-mono font-bold tracking-tighter">{formatter.format(prog.totalSpent)}</h2>
            <span class="text-sm text-muted-foreground">out of {formatter.format(prog.totalBudget)}</span>
          </div>
          
          <div class="mt-6 flex items-center space-x-3">
            <Progress value={prog.percentage} max={100} class="flex-1 h-3" />
            <span class="text-sm font-medium {prog.percentage > 90 ? 'text-destructive' : 'text-primary'}">
              {prog.percentage}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Category Breakdown -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Top Categories</CardTitle>
          <Button variant="ghost" size="sm" class="text-xs" href="/budgets">View All</Button>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Sort by spent, get top 4 -->
          {#each [...prog.categories].sort((a,b) => b.spent - a.spent).slice(0, 4) as cat}
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full" style="background-color: {cat.category.color}"></span>
                  <span>{cat.category.name}</span>
                </div>
                <span class="font-mono">{formatter.format(cat.spent)}</span>
              </div>
              <Progress value={cat.percentage} max={100} class="h-1.5" />
            </div>
          {/each}
        </CardContent>
      </Card>

      <!-- Recent Expenses -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-base">Recent Expenses</CardTitle>
          <Button variant="ghost" size="sm" class="text-xs" href="/expenses">All History</Button>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            {#each recentExpenses as expense}
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <TrendingDown class="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">{expense.notes || "Expense"}</p>
                    <p class="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span class="text-sm font-mono font-medium text-destructive">
                  -{formatter.format(expense.amount)}
                </span>
              </div>
            {:else}
              <p class="text-sm text-center text-muted-foreground py-4">No recent expenses.</p>
            {/each}
          </div>
        </CardContent>
      </Card>

    </div>
    
  {/if}

  <!-- Floating Add Button (Mobile Only) since BottomNav handles it, we can keep it out or just rely on BottomNav -->

</div>
