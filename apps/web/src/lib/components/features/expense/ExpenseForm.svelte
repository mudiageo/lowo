<script lang="ts">
  import { db } from "$lib/db";
  import { budgetStore } from "$lib/stores/budget.svelte";
  import * as v from "valibot";
  import { CreateExpenseSchema } from "$lib/features/expense/schemas";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import Plus from "@lucide/svelte/icons/plus";

  let { onSaveSuccess } = $props<{ onSaveSuccess: () => void }>();

  let amount = $state("");
  let categoryId = $state("");
  let notes = $state("");
  let paymentMethod = $state<"cash" | "transfer" | "card" | "ussd">("transfer");
  let expenseDate = $state(new Date().toISOString().split('T')[0]);
  let isAdding = $state(false);

  async function quickAdd() {
    if (!budgetStore.activePeriodId) {
      alert("Select an active budget period first.");
      return;
    }

    const payload = {
      categoryId,
      amount: Number(amount),
      date: new Date(expenseDate),
      paymentMethod,
      notes: notes || undefined
    };

    const result = v.safeParse(CreateExpenseSchema, payload);
    if (!result.success) {
      alert("Invalid input: " + result.issues[0].message);
      return;
    }

    try {
      isAdding = true;
      await db.expenses.add({
        id: crypto.randomUUID(),
        budgetPeriodId: budgetStore.activePeriodId,
        categoryId: result.output.categoryId,
        amount: result.output.amount,
        date: result.output.date,
        notes: result.output.notes,
        paymentMethod: result.output.paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      // Reset form & close
      amount = "";
      notes = "";
      onSaveSuccess();
    } catch (e) {
      console.error(e);
      alert("Failed to add expense");
    } finally {
      isAdding = false;
    }
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); quickAdd(); }} class="space-y-4">
  <div class="space-y-2">
    <Label>Amount</Label>
    <Input type="number" bind:value={amount} placeholder="e.g. 1500" required />
  </div>

  <div class="space-y-2">
    <Label>Category</Label>
    <select bind:value={categoryId} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
      <option value="" disabled selected>Select Category</option>
      {#each budgetStore.categories as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>
  </div>

  <div class="space-y-2">
    <Label>Date</Label>
    <Input type="date" bind:value={expenseDate} required />
  </div>

  <div class="space-y-2">
    <Label>Payment Method</Label>
    <select bind:value={paymentMethod} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
      <option value="cash">Cash</option>
      <option value="transfer">Bank Transfer</option>
      <option value="card">Card / POS</option>
      <option value="ussd">USSD</option>
    </select>
  </div>

  <div class="space-y-2">
    <Label>Notes (Optional)</Label>
    <Input bind:value={notes} placeholder="e.g. Uber to work" />
  </div>

  <Button type="submit" class="w-full mt-4" disabled={isAdding || !budgetStore.activePeriodId}>
    {#if isAdding} Saving... {:else} <Plus class="w-4 h-4 mr-2" /> Save Expense {/if}
  </Button>
  {#if !budgetStore.activePeriodId}
    <p class="text-xs text-destructive text-center mt-2">No active budget period. Create one first.</p>
  {/if}
</form>
