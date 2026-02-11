<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Pencil, Check } from 'lucide-svelte';
	import type { ReflectionBlock } from '$lib/types/content';

	interface Props {
		reflection: ReflectionBlock;
		moduleId: number;
		initialValue?: string;
	}

	let { reflection, moduleId, initialValue = '' }: Props = $props();

	// State
	let value = $state(initialValue || reflection.initialValue || '');
	let lastSaved = $state<Date | null>(null);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	// Derived
	const characterCount = $derived(value.length);

	// Auto-save function (debounced)
	async function autoSave() {
		// Clear existing timeout
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		// Set new timeout for 2 seconds
		saveTimeout = setTimeout(async () => {
			await saveReflection();
			saveTimeout = null; // Clear after save completes
		}, 2000);
	}

	// Save to database
	async function saveReflection() {
		try {
			const response = await fetch('/api/progress/save-reflection', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					moduleId,
					reflectionId: reflection.id,
					value
				})
			});

			if (response.ok) {
				lastSaved = new Date();
			}
		} catch (error) {
			console.error('Failed to save reflection:', error);
		}
	}

	// Format time ago
	function formatTimeAgo(date: Date | null): string {
		if (!date) return '';

		const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

		if (seconds < 10) return 'just now';
		if (seconds < 60) return `${seconds} seconds ago`;

		const minutes = Math.floor(seconds / 60);
		if (minutes === 1) return '1 minute ago';
		if (minutes < 60) return `${minutes} minutes ago`;

		const hours = Math.floor(minutes / 60);
		if (hours === 1) return '1 hour ago';
		return `${hours} hours ago`;
	}

	// Handle input
	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		autoSave();
	}
</script>

<Card.Root class="border-purple-200 bg-purple-50">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-lg text-purple-900 flex items-center gap-2">
				<Pencil class="w-5 h-5" />
				Personal Reflection
			</Card.Title>
			<Badge variant="secondary">Not Required</Badge>
		</div>
	</Card.Header>

	<Card.Content class="space-y-3">
		<!-- Question -->
		<div class="bg-white p-4 rounded-lg border border-purple-100">
			<p class="text-gray-900 font-medium">{reflection.question}</p>
		</div>

		<!-- Textarea -->
		<div class="relative">
			<Textarea
				{value}
				oninput={handleInput}
				rows={6}
				placeholder="Share your thoughts here... Your reflection is private and will help you process what you're learning."
				class="resize-none border-purple-200 focus:border-purple-400 bg-white"
			/>

			<!-- Character count -->
			<div class="flex items-center justify-between mt-2 text-xs text-purple-700">
				<span>{characterCount} characters</span>

				<!-- Save status -->
				{#if lastSaved}
					<span class="flex items-center gap-1 text-green-700">
						<Check class="w-3 h-3" />
						Saved {formatTimeAgo(lastSaved)}
					</span>
				{:else if characterCount > 0}
					<span class="text-gray-500">Saving...</span>
				{/if}
			</div>
		</div>

		<!-- Help text -->
		<p class="text-xs text-purple-700 italic">
			💡 Your reflections are saved automatically and remain private. They help you process and
			apply what you're learning.
		</p>
	</Card.Content>
</Card.Root>
