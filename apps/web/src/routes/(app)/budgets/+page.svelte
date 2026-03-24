<script lang="ts">
	import { db } from '$lib/db';
	import { budgetStore } from '$lib/stores/budget.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import { getBudgetPeriodDates } from '$lib/features/budget/utils';
	import { liveQuery } from 'dexie';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ResponsiveFormModal from '$lib/components/layout/ResponsiveFormModal.svelte';
	import BudgetForm from '$lib/components/features/budget/BudgetForm.svelte';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Copy from '@lucide/svelte/icons/copy';

	const formatter = $derived(
		new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: appStore.settings?.currency || 'NGN',
			maximumFractionDigits: 0
		})
	);

	let isModalOpen = $state(false);
</script>

<div class="space-y-6 pb-24 md:pb-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight">Budgets</h1>
			<p class="text-sm text-muted-foreground">Manage your budget periods.</p>
		</div>
		<Button onclick={() => (isModalOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			New Budget
		</Button>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each budgetStore.periods as period}
			{@const dates = getBudgetPeriodDates(period)}
			{@const isActive = budgetStore.activePeriodId === period.id}
			<Card
				class="relative overflow-hidden {isActive ? 'border-primary ring-1 ring-primary/50' : ''}"
			>
				{#if isActive}
					<div
						class="absolute top-0 right-0 z-10 rounded-bl-lg bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground"
					>
						ACTIVE
					</div>
				{/if}
				<CardHeader class="pb-2 text-balance">
					<CardTitle class="flex items-center justify-between pr-12 text-lg">
						<span>{period.name}</span>
					</CardTitle>
					<p class="text-xs text-muted-foreground">
						{dates.start.toLocaleDateString()} — {dates.end.toLocaleDateString()}
					</p>
				</CardHeader>
				<CardContent>
					<p class="mt-2 font-mono text-2xl font-bold tracking-tighter">
						{formatter.format(period.totalAmount)}
					</p>
					<div class="mt-4 flex items-center space-x-2">
						<Button
							variant={isActive ? 'secondary' : 'default'}
							size="sm"
							class="flex-1"
							onclick={() => budgetStore.setActivePeriod(period.id)}
						>
							{isActive ? 'Currently Viewing' : 'View'}
						</Button>
						<Button variant="outline" size="icon" title="Duplicate Budget">
							<Copy class="h-4 w-4 text-muted-foreground" />
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<!-- Empty state -->
			<div
				class="col-span-full border border-dashed border-border rounded-xl p-12 text-center bg-card/50"
			>
				<h3 class="text-lg font-medium">No Budget Periods</h3>
				<p class="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
					You haven't created any budget periods yet. Create a new one to start tracking your
					spending.
				</p>
				<Button class="mt-4" onclick={() => (isModalOpen = true)}>Create Budget</Button>
			</div>
		{/each}
	</div>

	{#if budgetStore.activePeriodId}
		<div class="mt-12 flex items-center justify-between border-t border-border pt-8">
			<h2 class="font-heading text-xl font-bold">Category Allocations</h2>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each budgetStore.spendingProgress.categories as catProg}
				<div class="flex items-center justify-between rounded-xl border border-border bg-card p-4">
					<div class="flex items-center space-x-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
							style="color: {catProg.category.color}"
						>
							<DynamicIcon name={catProg.category.icon} />
						</div>
						<div>
							<p class="text-sm font-medium">{catProg.category.name}</p>
							<p class="text-xs text-muted-foreground">{catProg.percentage}% spent</p>
						</div>
					</div>
					<div class="text-right">
						<p class="font-mono text-sm">{formatter.format(catProg.spent)}</p>
						<p class="font-mono text-xs text-muted-foreground">
							/ {formatter.format(catProg.allocated)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<ResponsiveFormModal
	title="New Budget Period"
	description="Define the duration and total pool for your new budget."
	bind:open={isModalOpen}
>
	<BudgetForm onSaveSuccess={() => (isModalOpen = false)} />
</ResponsiveFormModal>
