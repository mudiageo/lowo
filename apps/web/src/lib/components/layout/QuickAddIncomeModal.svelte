<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte';
  import { db } from '$lib/db';
  import * as v from 'valibot';
  import { CreateIncomeSchema } from '$lib/features/income/schemas';
  import ResponsiveFormModal from '$lib/components/layout/ResponsiveFormModal.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import Plus from '@lucide/svelte/icons/plus';

  let label = $state('');
  let amount = $state('');
  let frequency = $state<'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'irregular'>('one_time');
  let incomeDate = $state(new Date().toISOString().split('T')[0]);
  let isAdding = $state(false);

  async function save() {
    const result = v.safeParse(CreateIncomeSchema, {
      label, amount: Number(amount), frequency, date: new Date(incomeDate)
    });
    if (!result.success) {
      alert('Invalid input: ' + result.issues[0].message);
      return;
    }
    try {
      isAdding = true;
      await db.incomes.add({
        id: crypto.randomUUID(),
        label: result.output.label,
        amount: result.output.amount,
        frequency: result.output.frequency,
        date: result.output.date,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      label = ''; amount = '';
      appStore.showQuickAddIncome = false;
    } catch (e) {
      alert('Failed to save income');
    } finally {
      isAdding = false;
    }
  }
</script>

<ResponsiveFormModal
  title="Log Income"
  description="Quickly record a new income source."
  bind:open={appStore.showQuickAddIncome}
>
  <form onsubmit={(e) => { e.preventDefault(); save(); }} class="space-y-4">
    <div class="space-y-2">
      <Label>Source / Label</Label>
      <Input bind:value={label} placeholder="e.g. November Salary" required />
    </div>
    <div class="space-y-2">
      <Label>Amount</Label>
      <Input type="number" bind:value={amount} placeholder="e.g. 500000" required />
    </div>
    <div class="space-y-2">
      <Label>Frequency</Label>
      <select bind:value={frequency} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
        <option value="one_time">One-time</option>
        <option value="weekly">Weekly</option>
        <option value="biweekly">BiWeekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
        <option value="irregular">Irregular</option>
      </select>
    </div>
    <div class="space-y-2">
      <Label>Date Received</Label>
      <Input type="date" bind:value={incomeDate} required />
    </div>
    <Button type="submit" class="mt-2 w-full" disabled={isAdding}>
      {#if isAdding} Saving... {:else}<Plus class="mr-2 h-4 w-4" />Save Income{/if}
    </Button>
  </form>
</ResponsiveFormModal>
