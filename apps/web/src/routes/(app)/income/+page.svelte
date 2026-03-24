<script lang="ts">
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import * as v from 'valibot';
	import { CreateIncomeSchema } from '$lib/features/income/schemas';
	import { liveQuery } from 'dexie';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ResponsiveFormModal from '$lib/components/layout/ResponsiveFormModal.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Banknote from '@lucide/svelte/icons/banknote';

	const formatter = $derived(
		new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: appStore.settings?.currency || 'NGN',
			maximumFractionDigits: 0
		})
	);

	let label = $state('');
	let amount = $state('');
	let frequency = $state<'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'irregular'>('one_time');
	let incomeDate = $state(new Date().toISOString().split('T')[0]);
	let isAdding = $state(false);
	let isModalOpen = $state(false);

	// Load incomes
	const recentIncomes = liveQuery(async () => {
		return await db.incomes.reverse().sortBy('date');
	});

	async function quickAdd() {
		const payload = {
			label,
			amount: Number(amount),
			frequency,
			date: new Date(incomeDate)
		};

		const result = v.safeParse(CreateIncomeSchema, payload);
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
			// Reset form
			label = '';
			amount = '';
			isModalOpen = false;
		} catch (e) {
			console.error(e);
			alert('Failed to add income');
		} finally {
			isAdding = false;
		}
	}
</script>

<div class="space-y-6 pb-24 md:pb-6">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight">Income</h1>
			<p class="text-sm text-muted-foreground">Track your earnings and cash inflow.</p>
		</div>
		<Button onclick={() => (isModalOpen = true)}>
			<Plus class="mr-2 h-4 w-4" /> Log Income
		</Button>
	</div>

	<div class="space-y-4">
		<Card>
			<div class="divide-y divide-border">
				{#if $recentIncomes && $recentIncomes.length > 0}
					<div class="max-h-[600px] overflow-y-auto">
						{#each $recentIncomes as income (income.id)}
							<div
								class="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
							>
								<div class="flex items-center space-x-4">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary"
									>
										<Banknote class="h-5 w-5" />
									</div>
									<div>
										<p class="text-sm font-medium">{income.label}</p>
										<div class="mt-0.5 flex items-center space-x-2 text-xs text-muted-foreground">
											<span class="capitalize">{income.frequency.replace('_', '-')}</span>
										</div>
									</div>
								</div>
								<div class="text-right">
									<p class="font-mono text-sm font-semibold text-primary">
										+{formatter.format(income.amount)}
									</p>
									<p class="mt-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
										{new Date(income.date).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										})}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="p-12 text-center text-muted-foreground">
						<p>No income logged yet.</p>
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>

<ResponsiveFormModal
	title="Log Income"
	description="Manually track a new source of income."
	bind:open={isModalOpen}
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			quickAdd();
		}}
		class="space-y-4"
	>
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
			<select
				bind:value={frequency}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				required
			>
				<option value="one_time">One-time</option>
				<option value="weekly">Weekly</option>
				<option value="biweekly">BiWeekly</option>
				<option value="monthly">Monthly</option>
				<option value="yearly">Yearly</option>
				<option value="irregular">Irregular</option>
			</select>
		</div>

		<div class="space-y-2">
			<Label>Received Date</Label>
			<Input type="date" bind:value={incomeDate} required />
		</div>

		<Button type="submit" class="mt-4 w-full" disabled={isAdding}>
			{#if isAdding}
				Saving...
			{:else}
				<Plus class="mr-2 h-4 w-4" /> Save Income
			{/if}
		</Button>
	</form>
</ResponsiveFormModal>
