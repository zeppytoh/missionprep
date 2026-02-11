<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Calendar, Save, CheckCircle2 } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Derived from props
	const user = $derived(data.user as { arrivalDate?: Date | string | null });
	const currentArrivalDate = $derived(
		user.arrivalDate ? new Date(user.arrivalDate).toISOString().split('T')[0] : ''
	);

	// State - initialize once on mount
	let arrivalDate = $state('');
	let initialized = false;

	$effect(() => {
		if (!initialized) {
			arrivalDate = currentArrivalDate;
			initialized = true;
		}
	});
	let saving = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state('');

	// Derived
	const hasChanged = $derived(arrivalDate !== currentArrivalDate);
	const daysUntil = $derived.by(() => {
		if (!arrivalDate) return null;
		const arrival = new Date(arrivalDate);
		const today = new Date();
		const diff = Math.ceil((arrival.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		return diff;
	});

	// Functions
	async function saveArrivalDate() {
		if (!arrivalDate || saving) return;

		saving = true;
		saveSuccess = false;
		saveError = '';

		try {
			const response = await fetch('/api/profile/update-arrival-date', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ arrivalDate })
			});

			const result = await response.json();

			if (response.ok) {
				saveSuccess = true;
				setTimeout(() => {
					saveSuccess = false;
				}, 3000);
			} else {
				saveError = result.error || 'Failed to save';
			}
		} catch (error) {
			saveError = 'Network error. Please try again.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl px-4 pt-8 pb-24">
	<h1 class="text-2xl font-bold text-slate-900">Profile</h1>
	<p class="mt-1 text-sm text-slate-500">Manage your account and arrival details</p>

	<div class="mt-8 space-y-6">
		<!-- Basic info -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Account Information</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div>
					<Label class="text-sm font-medium text-gray-700">Name</Label>
					<p class="mt-1 text-sm text-gray-900">{data.user.name}</p>
				</div>
				<div>
					<Label class="text-sm font-medium text-gray-700">Email</Label>
					<p class="mt-1 text-sm text-gray-900">{data.user.email}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Arrival date -->
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2">
					<Calendar class="w-5 h-5 text-blue-600" />
					<Card.Title>Japan Arrival Date</Card.Title>
				</div>
				<p class="text-sm text-gray-600 mt-1">
					Set your arrival date to track your countdown and manage your preparation timeline
				</p>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div>
					<Label for="arrival-date">Arrival Date</Label>
					<Input
						id="arrival-date"
						type="date"
						bind:value={arrivalDate}
						min={new Date().toISOString().split('T')[0]}
						class="mt-1"
					/>
					{#if daysUntil !== null}
						{@const days = daysUntil}
						{#if days !== null}
							<p class="text-sm text-gray-600 mt-2">
								{#if days > 0}
									{days} days until arrival
								{:else if days === 0}
									You're leaving today!
								{:else}
									This date has passed
								{/if}
							</p>
						{/if}
					{/if}
				</div>

				{#if saveError}
					<p class="text-sm text-red-600">{saveError}</p>
				{/if}

				{#if saveSuccess}
					<div class="flex items-center gap-2 text-sm text-green-700">
						<CheckCircle2 class="w-4 h-4" />
						<span>Arrival date saved successfully!</span>
					</div>
				{/if}

				<Button
					onclick={saveArrivalDate}
					disabled={!hasChanged || saving}
					class="flex items-center gap-2"
				>
					<Save class="w-4 h-4" />
					{saving ? 'Saving...' : 'Save Changes'}
				</Button>
			</Card.Content>
		</Card.Root>

		<!-- Help text -->
		<Card.Root class="border-blue-200 bg-blue-50">
			<Card.Content class="p-4">
				<p class="text-sm text-blue-900">
					💡 <strong>Tip:</strong> Setting your arrival date helps you stay on track with your preparation.
					The dashboard will show a countdown and recommend modules based on your timeline.
				</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
