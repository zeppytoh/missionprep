<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { CheckCircle2, Lock, Clock } from 'lucide-svelte';
	import type { ModuleStatus } from '$lib/types/content';

	interface Props {
		module: {
			id: number;
			slug: string;
			title: string;
			description?: string;
			estimatedMinutes: number;
			tier: number;
		};
		status: 'locked' | ModuleStatus;
		progress?: {
			currentPage: number;
			quizScore: number | null;
			completedAt: Date | null;
		};
		incompletePrerequisites?: string[];
		href?: string;
	}

	let {
		module,
		status,
		progress = { currentPage: 0, quizScore: null, completedAt: null },
		incompletePrerequisites = [],
		href = `/modules/${module.slug}`
	}: Props = $props();

	const isLocked = $derived(status === 'locked');
	const isCompleted = $derived(status === 'completed');
	const isInProgress = $derived(status === 'in_progress');
	const isNotStarted = $derived(status === 'not_started');

	const tierColors = {
		1: 'default',
		2: 'secondary'
	} as const;

	const tierLabels = {
		1: 'Pre-Arrival',
		2: 'Ministry Prep'
	} as const;

	function formatDate(date: Date | null): string {
		if (!date) return '';
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric'
		}).format(date);
	}
</script>

<Card.Root
	class="transition-all hover:shadow-md {isLocked ? 'opacity-60' : ''} {isCompleted
		? 'border-green-500 border-2'
		: ''}"
>
	<a
		{href}
		class="block {isLocked ? 'pointer-events-none' : ''}"
		tabindex={isLocked ? -1 : 0}
	>
		<Card.Content class="p-4">
			<!-- Header -->
			<div class="flex items-start justify-between gap-3 mb-2">
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-1">
						<Badge variant={tierColors[module.tier as 1 | 2]}>
							Tier {module.tier}: {tierLabels[module.tier as 1 | 2]}
						</Badge>
						{#if isCompleted}
							<CheckCircle2 class="w-5 h-5 text-green-600" />
						{:else if isLocked}
							<Lock class="w-5 h-5 text-gray-400" />
						{:else if isInProgress}
							<Clock class="w-5 h-5 text-blue-600" />
						{/if}
					</div>
					<h3 class="text-lg font-semibold text-gray-900 {isLocked ? 'text-gray-500' : ''}">
						{module.title}
					</h3>
				</div>
			</div>

			<!-- Description -->
			{#if module.description}
				<p class="text-sm text-gray-600 mb-3 line-clamp-2">
					{module.description}
				</p>
			{/if}

			<!-- Status-specific content -->
			<div class="mt-3 space-y-2">
				{#if isLocked}
					<!-- Locked state -->
					<div class="text-sm text-gray-500 bg-gray-50 p-2 rounded">
						🔒 Complete these first:
						<ul class="mt-1 ml-4 list-disc">
							{#each incompletePrerequisites as prereq}
								<li class="capitalize">{prereq.replace(/-/g, ' ')}</li>
							{/each}
						</ul>
					</div>
				{:else if isCompleted}
					<!-- Completed state -->
					<div class="flex items-center justify-between text-sm">
						<span class="text-green-700 font-medium">✓ Completed</span>
						<div class="text-right">
							{#if progress.completedAt}
								<p class="text-gray-600">{formatDate(progress.completedAt)}</p>
							{/if}
							{#if progress.quizScore !== null}
								<p class="text-gray-600">Score: {progress.quizScore}%</p>
							{/if}
						</div>
					</div>
				{:else if isInProgress}
					<!-- In Progress state -->
					<div class="space-y-1">
						<div class="flex items-center justify-between text-sm">
							<span class="text-blue-700 font-medium">In Progress</span>
							<span class="text-gray-600">Page {progress.currentPage + 1} of 7</span>
						</div>
						<Progress value={(progress.currentPage + 1) / 7 * 100} class="h-2" />
					</div>
				{:else}
					<!-- Not Started state -->
					<div class="flex items-center justify-between text-sm text-gray-600">
						<span>⏱️ {module.estimatedMinutes} minutes</span>
						<span class="text-blue-600 font-medium">Start →</span>
					</div>
				{/if}
			</div>
		</Card.Content>
	</a>
</Card.Root>
