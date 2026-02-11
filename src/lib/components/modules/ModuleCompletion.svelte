<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CheckCircle2, Lock, ArrowRight } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		moduleId: number;
		moduleSlug: string;
		hasQuiz: boolean;
		quizPassed: boolean;
		isCompleted: boolean;
	}

	let { moduleId, moduleSlug, hasQuiz, quizPassed, isCompleted = false }: Props = $props();

	// State
	let completing = $state(false);
	let completionError = $state('');

	// Derived
	const canComplete = $derived(!hasQuiz || quizPassed);

	// Functions
	async function markComplete() {
		if (!canComplete || completing) return;

		completing = true;
		completionError = '';

		try {
			const response = await fetch('/api/progress/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ moduleId })
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect to modules list with success message
				goto('/modules?completed=' + moduleSlug);
			} else {
				completionError = data.error || 'Failed to complete module';
			}
		} catch (error) {
			completionError = 'Network error. Please try again.';
		} finally {
			completing = false;
		}
	}
</script>

{#if isCompleted}
	<!-- Already completed -->
	<Card.Root class="border-green-500 bg-green-50">
		<Card.Content class="p-6">
			<div class="flex items-center gap-4">
				<CheckCircle2 class="w-12 h-12 text-green-600" />
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-green-900">Module Completed!</h3>
					<p class="text-sm text-green-700 mt-1">
						You've successfully completed this module. Feel free to review the content anytime.
					</p>
				</div>
				<Button onclick={() => goto('/modules')} variant="outline" class="flex items-center gap-2">
					View All Modules
					<ArrowRight class="w-4 h-4" />
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
{:else if !canComplete}
	<!-- Requirements not met -->
	<Card.Root class="border-amber-500 bg-amber-50">
		<Card.Content class="p-6">
			<div class="flex items-start gap-4">
				<Lock class="w-8 h-8 text-amber-600 flex-shrink-0" />
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-amber-900">Complete the Requirements</h3>
					<p class="text-sm text-amber-700 mt-2">
						To complete this module, you need to:
					</p>
					<ul class="mt-3 space-y-2 text-sm text-amber-800">
						{#if hasQuiz && !quizPassed}
							<li class="flex items-center gap-2">
								<span class="w-5 h-5 flex items-center justify-center bg-amber-200 rounded-full text-xs">
									○
								</span>
								Pass the module quiz (scroll up to find it)
							</li>
						{/if}
					</ul>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{:else}
	<!-- Ready to complete -->
	<Card.Root class="border-blue-500 bg-blue-50">
		<Card.Content class="p-6">
			<div class="flex items-center gap-4">
				<CheckCircle2 class="w-12 h-12 text-blue-600" />
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-blue-900">Ready to Complete</h3>
					<p class="text-sm text-blue-700 mt-1">
						You've met all requirements. Mark this module as complete to unlock the next one.
					</p>
					{#if completionError}
						<p class="text-sm text-red-600 mt-2">
							{completionError}
						</p>
					{/if}
				</div>
				<Button
					onclick={markComplete}
					disabled={completing}
					class="flex items-center gap-2 min-w-[150px]"
				>
					{#if completing}
						Completing...
					{:else}
						Mark Complete
					{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
