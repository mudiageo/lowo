<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { db } from '$lib/db';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/components/ui/card';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { lockStore, hashPin } from '$lib/stores/lock.svelte';

	// Clone settings to form to avoid auto-updating until saved
	let formSettings = $state({
		userName: appStore.settings?.userName || '',
		currency: appStore.settings?.currency || 'NGN',
		theme: appStore.settings?.theme || 'dark',
		geminiApiKey: appStore.settings?.geminiApiKey || '',
		pinEnabled: appStore.settings?.pinEnabled || false,
		pinHash: appStore.settings?.pinHash,
		biometricEnabled: appStore.settings?.biometricEnabled || false
	});

	let isSaving = $state(false);

	async function saveSettings() {
		isSaving = true;
		try {
			await appStore.updateSettings(formSettings);

			// Apply theme
			if (formSettings.theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}

			alert('Settings saved successfully.');
		} catch (e) {
			alert('Failed to save settings.');
		} finally {
			isSaving = false;
		}
	}

	async function clearData() {
		const confirmation = prompt(
			"This will delete ALL your data locally. Type 'DELETE' to confirm."
		);
		if (confirmation === 'DELETE') {
			try {
				await Promise.all([
					db.budgetPeriods.clear(),
					db.budgetCategories.clear(),
					db.expenses.clear(),
					db.incomes.clear(),
					db.savingsGoals.clear(),
					db.savingsContributions.clear(),
					db.aiInsights.clear(),
					appStore.updateSettings({ hasCompletedOnboarding: false }) // Keep simple settings like name but trigger onboarding again
				]);
				window.location.href = '/onboarding';
			} catch (e) {
				alert('Failed to clear data.');
			}
		}
	}
</script>

<div class="mx-auto max-w-3xl space-y-6 pb-24 md:pb-6">
	<div>
		<h1 class="font-heading text-2xl font-bold tracking-tight">Settings</h1>
		<p class="text-sm text-muted-foreground">Manage your application preferences and data.</p>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			saveSettings();
		}}
	>
		<Card>
			<CardHeader>
				<CardTitle>Preferences</CardTitle>
				<CardDescription>Update your personal information and app appearance.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label>Your Name</Label>
					<Input bind:value={formSettings.userName} placeholder="e.g. Chinedu" required />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label>Base Currency</Label>
						<select
							bind:value={formSettings.currency}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							required
						>
							<option value="NGN">NGN (₦)</option>
							<option value="USD">USD ($)</option>
							<option value="GBP">GBP (£)</option>
							<option value="EUR">EUR (€)</option>
						</select>
					</div>
					<div class="space-y-2">
						<Label>Theme</Label>
						<select
							bind:value={formSettings.theme}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							required
						>
							<option value="dark">Dark</option>
							<option value="light">Light</option>
						</select>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="mt-6">
			<CardHeader>
				<CardTitle>Security</CardTitle>
				<CardDescription>Protect your financial data with local authentication.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<div class="flex items-center justify-between">
					<div class="space-y-0.5">
						<Label>PIN Protection</Label>
						<p class="text-xs text-muted-foreground">Require a 4-digit PIN to open the app.</p>
					</div>
					<button
						type="button"
						onclick={async (e) => {
							e.stopPropagation();
							console.log('PIN Toggle Clicked, current state:', formSettings.pinEnabled);
							if (!formSettings.pinEnabled) {
								const pinInput = prompt('Enter a 4-digit PIN:');
								if (pinInput && pinInput.length === 4) {
									const h = await hashPin(pinInput);
									formSettings.pinHash = h;
									formSettings.pinEnabled = true;
									alert('PIN successfully set!');
								} else if (pinInput) {
									alert('PIN must be exactly 4 digits.');
								}
							} else {
								formSettings.pinEnabled = false;
								formSettings.pinHash = undefined;
								formSettings.biometricEnabled = false;
								alert('PIN protection disabled.');
							}
						}}
						class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {formSettings.pinEnabled
							? 'bg-primary'
							: 'bg-muted'}"
					>
						<span
							class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out {formSettings.pinEnabled
								? 'translate-x-5'
								: 'translate-x-0'}"
						></span>
					</button>
				</div>

				{#if formSettings.pinEnabled}
					<div class="flex items-center justify-between border-t border-border pt-4">
						<div class="space-y-0.5">
							<Label>Biometric Auth</Label>
							<p class="text-xs text-muted-foreground">Unlock with fingerprint or face ID.</p>
						</div>
						<button
							type="button"
							onclick={async () => {
								if (!formSettings.biometricEnabled) {
									const ok = await lockStore.registerBiometric();
									if (ok) {
										formSettings.biometricEnabled = true;
										alert('Biometric verification enrolled!');
									} else {
										alert('Biometric enrollment failed. Try again.');
									}
								} else {
									formSettings.biometricEnabled = false;
								}
							}}
							class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {formSettings.biometricEnabled
								? 'bg-primary'
								: 'bg-muted'}"
						>
							<span
								class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out {formSettings.biometricEnabled
									? 'translate-x-5'
									: 'translate-x-0'}"
							></span>
						</button>
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card class="mt-6">
			<CardHeader>
				<CardTitle>AI Integration (Gemini)</CardTitle>
				<CardDescription
					>Configure your API key for personalized financial insights.</CardDescription
				>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label>Google Gemini API Key</Label>
					<Input type="password" bind:value={formSettings.geminiApiKey} placeholder="AIzaSy..." />
					<p class="text-xs text-muted-foreground">
						Your key is stored locally in IndexedDB and never sent to our servers.
					</p>
				</div>
			</CardContent>
			<CardFooter>
				<Button type="submit" class="w-full" disabled={isSaving}>
					{#if isSaving}
						Saving...
					{:else}
						<Save class="mr-2 h-4 w-4" /> Save Settings
					{/if}
				</Button>
			</CardFooter>
		</Card>
	</form>

	<Card class="mt-12 border-destructive/50 bg-destructive/5">
		<CardHeader>
			<CardTitle class="text-destructive">Danger Zone</CardTitle>
			<CardDescription>Irreversible actions for your local data.</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex items-center justify-between">
				<div>
					<h4 class="text-sm font-medium">Clear Application Data</h4>
					<p class="max-w-[250px] text-xs text-muted-foreground sm:max-w-none">
						This will permanently delete all your budgets, expenses, incomes, and goals from this
						device.
					</p>
				</div>
				<Button variant="destructive" onclick={clearData}>
					<Trash2 class="mr-2 h-4 w-4" /> Clear All Data
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
