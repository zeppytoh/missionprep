<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { ChevronLeft, ChevronRight, Home } from 'lucide-svelte';
	import ContentBlock from '$lib/components/modules/ContentBlock.svelte';
	import ModuleCompletion from '$lib/components/modules/ModuleCompletion.svelte';
	import type { PageData } from './$types';
	import type { ModulePage, QuizBlock } from '$lib/types/content';

	let { data }: { data: PageData } = $props();

	// Cast pages to proper type
	const pages = (data.module.pages as unknown as ModulePage[]) || [];

	// Current page state (0-indexed, 0-6 for pages 1-7)
	let currentPageIndex = $state(data.progress?.currentPage || 0);

	// Derived values
	const currentPage = $derived(pages[currentPageIndex]);
	const totalPages = $derived(pages.length);
	const progressPercentage = $derived(((currentPageIndex + 1) / totalPages) * 100);
	const isLastPage = $derived(currentPageIndex === totalPages - 1);

	// Check if module has a completion quiz
	const hasCompletionQuiz = $derived(
		pages.some((page) =>
			page.blocks.some((block) => block.type === 'quiz' && (block as QuizBlock).isCompletionQuiz)
		)
	);

	// Check if quiz is passed (70% or higher)
	const quizPassed = $derived(
		!hasCompletionQuiz || (data.progress?.quizScore !== null && data.progress.quizScore >= 70)
	);

	// Check if module is completed
	const isCompleted = $derived(data.progress?.status === 'completed');

	// Navigation functions
	async function goToPage(pageIndex: number) {
		if (pageIndex < 0 || pageIndex >= totalPages) return;

		currentPageIndex = pageIndex;

		// Update progress in database
		await fetch(`/api/progress/update-page`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				moduleId: data.module.id,
				currentPage: pageIndex
			})
		});
	}

	function nextPage() {
		goToPage(currentPageIndex + 1);
	}

	function prevPage() {
		goToPage(currentPageIndex - 1);
	}

	const canGoNext = $derived(currentPageIndex < totalPages - 1);
	const canGoPrev = $derived(currentPageIndex > 0);
</script>

<div class="mx-auto max-w-4xl px-4 pt-4 pb-24">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
			<a href="/dashboard" class="hover:text-gray-900 flex items-center gap-1">
				<Home class="w-4 h-4" />
				Dashboard
			</a>
			<span>/</span>
			<a href="/modules" class="hover:text-gray-900">Learning Path</a>
			<span>/</span>
			<span class="text-gray-900">{data.module.title}</span>
		</div>

		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<h1 class="text-2xl font-bold text-gray-900">{data.module.title}</h1>
				{#if data.module.description}
					<p class="text-sm text-gray-600 mt-1">{data.module.description}</p>
				{/if}
			</div>
			<Badge variant={data.module.tier === 1 ? 'default' : 'secondary'}>
				Tier {data.module.tier}
			</Badge>
		</div>

		<!-- Progress indicator -->
		<div class="mt-4">
			<div class="flex items-center justify-between text-sm text-gray-600 mb-2">
				<span>Page {currentPageIndex + 1} of {totalPages}</span>
				<span>{Math.round(progressPercentage)}% complete</span>
			</div>
			<Progress value={progressPercentage} class="h-2" />
		</div>
	</div>

	<!-- Page content -->
	{#if currentPage}
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="text-xl">{currentPage.title}</Card.Title>
			</Card.Header>
			<Card.Content class="prose prose-slate max-w-none">
				{#each currentPage.blocks as block}
					<ContentBlock
						{block}
						moduleId={data.module.id}
						reflectionsData={(data.progress?.reflectionsData as Record<string, string>) || {}}
					/>
				{/each}
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Content class="p-8 text-center text-gray-500">
				<p>Page content not available</p>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Module completion (shown on last page) -->
	{#if isLastPage}
		<div class="mb-6">
			<ModuleCompletion
				moduleId={data.module.id}
				moduleSlug={data.module.slug}
				hasQuiz={hasCompletionQuiz}
				{quizPassed}
				{isCompleted}
			/>
		</div>
	{/if}

	<!-- Navigation -->
	<div class="flex items-center justify-between gap-4">
		<Button
			variant="outline"
			onclick={prevPage}
			disabled={!canGoPrev}
			class="flex items-center gap-2"
		>
			<ChevronLeft class="w-4 h-4" />
			Previous
		</Button>

		<!-- Page dots navigation -->
		<div class="flex items-center gap-2">
			{#each Array(totalPages) as _, index}
				<button
					onclick={() => goToPage(index)}
					class="w-2 h-2 rounded-full transition-colors {index === currentPageIndex
						? 'bg-blue-600'
						: 'bg-gray-300 hover:bg-gray-400'}"
					aria-label="Go to page {index + 1}"
				></button>
			{/each}
		</div>

		<Button onclick={nextPage} disabled={!canGoNext} class="flex items-center gap-2">
			Next
			<ChevronRight class="w-4 h-4" />
		</Button>
	</div>

	<!-- Footer info -->
	<div class="mt-6 text-center text-sm text-gray-500">
		<p>Estimated time: {data.module.estimatedMinutes} minutes total</p>
	</div>
</div>
