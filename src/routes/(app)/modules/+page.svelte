<script lang="ts">
	import { ModuleCard } from '$lib/components/modules';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import {
		getModuleStatus,
		getIncompletePrerequisites,
		type ModuleWithPrerequisites,
		type UserProgressRecord
	} from '$lib/utils/prerequisites';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Group modules by tier
	const tier1Modules = $derived(data.modules.filter((m) => m.tier === 1));
	const tier2Modules = $derived(data.modules.filter((m) => m.tier === 2));

	// Calculate tier progress
	function getTierProgress(modules: typeof data.modules): { completed: number; total: number } {
		const completed = modules.filter((m) => {
			const progress = data.progress.find((p) => p.moduleId === m.id);
			return progress?.status === 'completed';
		}).length;
		return { completed, total: modules.length };
	}

	const tier1Progress = $derived(getTierProgress(tier1Modules));
	const tier2Progress = $derived(getTierProgress(tier2Modules));

	// Map modules and progress for prerequisite utils
	const modulesForUtils: ModuleWithPrerequisites[] = $derived(
		data.modules.map((m) => ({
			id: m.id,
			slug: m.slug,
			prerequisites: m.prerequisites
		}))
	);

	const progressForUtils: UserProgressRecord[] = $derived(
		data.progress.map((p) => ({
			moduleId: p.moduleId,
			status: p.status as 'not_started' | 'in_progress' | 'completed'
		}))
	);
</script>

<div class="mx-auto max-w-3xl px-4 pt-8 pb-24">
	<h1 class="text-2xl font-bold text-slate-900">Learning Path</h1>
	<p class="mt-1 text-sm text-slate-500">Your preparation journey for Japan ministry</p>

	<!-- Tier 1: Pre-Arrival Essentials -->
	<section class="mt-8">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
					<Badge variant="default">Tier 1</Badge>
					Pre-Arrival Essentials
				</h2>
				<p class="text-sm text-slate-600 mt-1">
					{tier1Progress.completed} of {tier1Progress.total} completed
				</p>
			</div>
		</div>

		<Progress value={(tier1Progress.completed / tier1Progress.total) * 100} class="mb-4" />

		<div class="space-y-4">
			{#each tier1Modules as module}
				{@const status = getModuleStatus(module, modulesForUtils, progressForUtils)}
				{@const progress = data.progress.find((p) => p.moduleId === module.id)}
				{@const incompletePrereqs = getIncompletePrerequisites(
					module,
					modulesForUtils,
					progressForUtils
				)}
				<ModuleCard
					{module}
					{status}
					progress={progress
						? {
								currentPage: progress.currentPage,
								quizScore: progress.quizScore,
								completedAt: progress.completedAt
							}
						: undefined}
					incompletePrerequisites={incompletePrereqs}
				/>
			{/each}
		</div>
	</section>

	<!-- Tier 2: Ministry Preparation -->
	<section class="mt-12">
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
					<Badge variant="secondary">Tier 2</Badge>
					Ministry Preparation
				</h2>
				<p class="text-sm text-slate-600 mt-1">
					{tier2Progress.completed} of {tier2Progress.total} completed
				</p>
			</div>
		</div>

		<Progress value={(tier2Progress.completed / tier2Progress.total) * 100} class="mb-4" />

		<div class="space-y-4">
			{#if tier2Modules.length === 0}
				<p class="text-sm text-slate-500 italic">No modules in this tier yet</p>
			{:else}
				{#each tier2Modules as module}
					{@const status = getModuleStatus(module, modulesForUtils, progressForUtils)}
					{@const progress = data.progress.find((p) => p.moduleId === module.id)}
					{@const incompletePrereqs = getIncompletePrerequisites(
						module,
						modulesForUtils,
						progressForUtils
					)}
					<ModuleCard
						{module}
						{status}
						progress={progress
							? {
									currentPage: progress.currentPage,
									quizScore: progress.quizScore,
									completedAt: progress.completedAt
								}
							: undefined}
						incompletePrerequisites={incompletePrereqs}
					/>
				{/each}
			{/if}
		</div>
	</section>
</div>
