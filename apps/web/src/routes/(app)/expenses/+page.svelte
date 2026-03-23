<script lang="ts">
	import { db } from '$lib/db';
	import { budgetStore } from '$lib/stores/budget.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import * as v from 'valibot';
	import { CreateExpenseSchema } from '$lib/features/expense/schemas';
	import { liveQuery } from 'dexie';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';

	const formatter = $derived(
		new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: appStore.settings?.currency || 'NGN',
			maximumFractionDigits: 0
		})
	);

	let amount = $state('');
	let categoryId = $state('');
	let notes = $state('');
	let paymentMethod = $state<'cash' | 'transfer' | 'card' | 'ussd'>('transfer');
	let expenseDate = $state(new Date().toISOString().split('T')[0]);
	let isAdding = $state(false);

	// Load recent expenses for active period
	let recentExpenses = $derived.by(() => {
		return liveQuery(async () => {
			if (!budgetStore.activePeriodId) return [];
			const expenses = await db.expenses
				.where('budgetPeriodId')
				.equals(budgetStore.activePeriodId)
				.reverse()
				.sortBy('date');

			return Promise.all(
				expenses.map(async (exp) => {
					const cat = await db.budgetCategories.get(exp.categoryId);
					return { ...exp, category: cat };
				})
			);
		});
	});

	async function quickAdd() {
		if (!budgetStore.activePeriodId) return alert('Select an active budget period first.');

		const payload = {
			categoryId,
			amount: Number(amount),
			date: new Date(expenseDate),
			paymentMethod,
			notes: notes || undefined
		};

		const result = v.safeParse(CreateExpenseSchema, payload);
		if (!result.success) {
			alert('Invalid input: ' + result.issues[0].message);
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
			// Reset form
			amount = '';
			notes = '';
			// Keep category and payment method for quick consecutive additions
		} catch (e) {
			console.error(e);
			alert('Failed to add expense');
		} finally {
			isAdding = false;
		}
	}
</script>

<div class="space-y-6 pb-24 md:pb-6">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight">Expenses</h1>
			<p class="text-sm text-muted-foreground">Track where your money goes.</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Quick Add Form -->
		<div class="lg:col-span-1">
			<Card class="sticky top-6">
				<CardHeader>
					<CardTitle>Log Expense</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onsubmit={(e) => {
							e.preventDefault();
							quickAdd();
						}}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label>Amount</Label>
							<Input type="number" bind:value={amount} placeholder="e.g. 1500" required />
						</div>

						<div class="space-y-2">
							<Label>Category</Label>
							<select
								bind:value={categoryId}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								required
							>
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
							<select
								bind:value={paymentMethod}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								required
							>
								<option value="cash">Cash</option>
								<option value="transfer">Bank Transfer</option>
								<option value="card">Card / POS</option>
								<option value="ussd">USSD</option>
								<option value="other">Other</option>
							</select>
						</div>

						<div class="space-y-2">
							<Label>Notes (Optional)</Label>
							<Input bind:value={notes} placeholder="e.g. Uber to work" />
						</div>

						<Button type="submit" class="w-full" disabled={isAdding || !budgetStore.activePeriodId}>
							{#if isAdding}
								Saving...
							{:else}
								<Plus class="mr-2 h-4 w-4" /> Quick Add
							{/if}
						</Button>
						{#if !budgetStore.activePeriodId}
							<p class="mt-2 text-center text-xs text-destructive">
								No active budget period. Create one first.
							</p>
						{/if}
					</form>
				</CardContent>
			</Card>
		</div>

		<!-- Recent Expenses List -->
		<div class="space-y-4 lg:col-span-2">
			<div class="flex items-center space-x-2">
				<div class="relative flex-1">
					<Search class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
					<Input type="search" placeholder="Search expenses..." class="bg-card pl-9" />
				</div>
				<Button variant="outline" size="icon">
					<Filter class="h-4 w-4" />
				</Button>
			</div>

			<Card>
				<div class="divide-y divide-border">
					{#if $recentExpenses && $recentExpenses.length > 0}
						<div class="max-h-[600px] overflow-y-auto">
							{#each $recentExpenses as expense (expense.id)}
								<div
									class="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
								>
									<div class="flex items-center space-x-4">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
											style="color: {expense.category?.color || '#888'}"
										>
											<span class="font-bold">{expense.category?.name.charAt(0) || '?'}</span>
										</div>
										<div>
											<p class="text-sm font-medium">{expense.notes || expense.category?.name}</p>
											<div class="mt-0.5 flex items-center space-x-2 text-xs text-muted-foreground">
												<span>{expense.category?.name}</span>
												<span>•</span>
												<span>{expense.paymentMethod.replace('_', ' ')}</span>
											</div>
										</div>
									</div>
									<div class="text-right">
										<p class="font-mono text-sm font-semibold">
											{formatter.format(expense.amount)}
										</p>
										<p class="mt-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
											{new Date(expense.date).toLocaleDateString(undefined, {
												month: 'short',
												day: 'numeric'
											})}
										</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="p-12 text-center text-muted-foreground">
							<p>No expenses logged for this period yet.</p>
						</div>
					{/if}
				</div>
			</Card>
		</div>
	</div>
</div>
