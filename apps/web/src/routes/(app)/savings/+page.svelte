<script lang="ts">
  import { db } from "$lib/db";
  import { appStore } from "$lib/stores/app.svelte";
  import * as v from "valibot";
  import { CreateSavingsGoalSchema } from "$lib/features/savings/schemas";
  import { liveQuery } from "dexie";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Progress } from "$lib/components/ui/progress";
  import ResponsiveFormModal from "$lib/components/layout/ResponsiveFormModal.svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Target from "@lucide/svelte/icons/target";

  const formatter = $derived(new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: appStore.settings?.currency || 'NGN',
    maximumFractionDigits: 0
  }));

  let name = $state("");
  let targetAmount = $state("");
  let targetDate = $state(new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]);
  let color = $state("#3B82F6");
  let isAddingGoal = $state(false);
  let isModalOpen = $state(false);

  // Load goals with progress
  const goalsWithProgress = liveQuery(async () => {
    const goals = await db.savingsGoals.sortBy('targetDate');
    const result = [];
    for (const goal of goals) {
      const contributions = await db.savingsContributions.where('savingsGoalId').equals(goal.id).toArray();
      const currentAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
      result.push({
        ...goal,
        currentAmount,
        percentage: Math.min(100, Math.round((currentAmount / goal.targetAmount) * 100))
      });
    }
    return result;
  });

  async function quickAddGoal() {
    const payload = {
      name,
      targetAmount: Number(targetAmount),
      targetDate: new Date(targetDate),
      icon: "target",
      color
    };

    const result = v.safeParse(CreateSavingsGoalSchema, payload);
    if (!result.success) {
      alert("Invalid input: " + result.issues.map(i => i.message).join(", "));
      return;
    }

    try {
      isAddingGoal = true;
      await db.savingsGoals.add({
        id: crypto.randomUUID(),
        name: result.output.name,
        targetAmount: result.output.targetAmount,
        targetDate: result.output.targetDate,
        icon: result.output.icon,
        color: result.output.color,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCompleted: false
      });
      // Reset form
      name = "";
      targetAmount = "";
      isModalOpen = false;
    } catch(e) {
      console.error(e);
      alert("Failed to create savings goal");
    } finally {
      isAddingGoal = false;
    }
  }

  // Quick contribute component states
  let activeContributeGoalId = $state<string | null>(null);
  let contributeAmount = $state("");

  async function addContribution(goalId: string) {
    if (!contributeAmount || Number(contributeAmount) <= 0) return;

    try {
      await db.savingsContributions.add({
        id: crypto.randomUUID(),
        savingsGoalId: goalId,
        amount: Number(contributeAmount),
        date: new Date(),
        createdAt: new Date()
      });
      activeContributeGoalId = null;
      contributeAmount = "";
    } catch(e) {
      alert("Failed to add contribution");
    }
  }

</script>

<div class="space-y-6 pb-24 md:pb-6">
  
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-heading font-bold tracking-tight">Savings Goals</h1>
      <p class="text-muted-foreground text-sm">Set targets and watch your savings grow.</p>
    </div>
    <Button onclick={() => isModalOpen = true}>
      <Plus class="w-4 h-4 mr-2" /> New Goal
    </Button>
  </div>

  <div class="space-y-4">
    {#if $goalsWithProgress}
      {#if $goalsWithProgress.length === 0}
          <div class="p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <Target class="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No savings goals created yet.</p>
            <p class="text-xs mt-1">Add your first goal to start saving.</p>
          </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each $goalsWithProgress as goal (goal.id)}
            <Card class="flex flex-col relative overflow-hidden group">
              <div class="absolute top-0 left-0 w-1 h-full" style="background-color: {goal.color}"></div>
              <CardHeader class="pb-2">
                <CardTitle class="text-lg">{goal.name}</CardTitle>
                <p class="text-xs text-muted-foreground">Target: {new Date(goal.targetDate).toLocaleDateString(undefined, {month:'long', year:'numeric'})}</p>
              </CardHeader>
              <CardContent class="flex-1 space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-mono font-medium">{formatter.format(goal.currentAmount)}</span>
                    <span class="text-muted-foreground font-mono">{formatter.format(goal.targetAmount)}</span>
                  </div>
                  <Progress value={goal.percentage} max={100} class="h-2" />
                  <p class="text-xs text-right mt-1 text-muted-foreground">{goal.percentage}% reached</p>
                </div>

                {#if activeContributeGoalId === goal.id}
                  <div class="flex items-center space-x-2 pt-2">
                    <Input type="number" bind:value={contributeAmount} placeholder="Amount" class="h-8 text-sm" />
                    <Button size="sm" class="h-8" onclick={() => addContribution(goal.id)}>Save</Button>
                    <Button size="sm" variant="ghost" class="h-8" onclick={() => activeContributeGoalId = null}>Cancel</Button>
                  </div>
                {:else}
                  <div class="pt-2">
                    <Button variant="secondary" size="sm" class="w-full" onclick={() => activeContributeGoalId = goal.id}>
                      <Plus class="w-3 h-3 mr-2" /> Add Funds
                    </Button>
                  </div>
                {/if}

              </CardContent>
            </Card>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

</div>

<ResponsiveFormModal
	title="Create Savings Goal"
	description="Define a new target to save towards."
	bind:open={isModalOpen}
>
  <form onsubmit={(e) => { e.preventDefault(); quickAddGoal(); }} class="space-y-4">
    <div class="space-y-2">
      <Label>Goal Name</Label>
      <Input bind:value={name} placeholder="e.g. Dream Car, Emergency Fund" required />
    </div>

    <div class="space-y-2">
      <Label>Target Amount</Label>
      <Input type="number" bind:value={targetAmount} placeholder="e.g. 5000000" required />
    </div>

    <div class="space-y-2">
      <Label>Target Date</Label>
      <Input type="date" bind:value={targetDate} required />
    </div>

    <div class="space-y-2">
      <Label>Theme Color</Label>
      <div class="flex items-center space-x-2">
        <input type="color" bind:value={color} class="w-10 h-10 rounded cursor-pointer border-none bg-transparent" />
        <span class="text-xs text-muted-foreground uppercase">{color}</span>
      </div>
    </div>

    <Button type="submit" class="w-full mt-4" disabled={isAddingGoal}>
      {#if isAddingGoal} Saving... {:else} <Plus class="w-4 h-4 mr-2" /> Create Goal {/if}
    </Button>
  </form>
</ResponsiveFormModal>
