<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-svelte';
	import { canAccessModule } from '$lib/utils/prerequisites';

	let { data }: { data: PageData } = $props();

	// Progress calculations
	const totalModules = $derived(data.modules.length);
	const completedModules = $derived(
		data.progress.filter((p) => p.status === 'completed').length
	);
	const overallProgress = $derived(
		totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
	);

	// Tier progress
	const tier1Modules = $derived(data.modules.filter((m) => m.tier === 1));
	const tier2Modules = $derived(data.modules.filter((m) => m.tier === 2));
	const tier1Completed = $derived(
		data.progress.filter(
			(p) => p.status === 'completed' && tier1Modules.some((m) => m.id === p.moduleId)
		).length
	);
	const tier2Completed = $derived(
		data.progress.filter(
			(p) => p.status === 'completed' && tier2Modules.some((m) => m.id === p.moduleId)
		).length
	);

	// Days until arrival
	const daysUntilArrival = $derived.by(() => {
		const user = data.user as { arrivalDate?: Date | string | null };
		if (!user.arrivalDate) return null;
		const arrival = new Date(user.arrivalDate);
		const today = new Date();
		const diff = Math.ceil((arrival.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		return diff;
	});

	// Next recommended module (first incomplete with met prerequisites)
	const nextModule = $derived.by(() => {
		const modulesForUtils = data.modules.map((m) => ({
			id: m.id,
			slug: m.slug,
			prerequisites: m.prerequisites
		}));

		const progressForUtils = data.progress.map((p) => ({
			moduleId: p.moduleId,
			status: p.status as 'not_started' | 'in_progress' | 'completed'
		}));

		return data.modules.find((m) => {
			const progress = data.progress.find((p) => p.moduleId === m.id);
			const isCompleted = progress?.status === 'completed';
			if (isCompleted) return false;

			return canAccessModule(m, modulesForUtils, progressForUtils);
		});
	});

	// Recently accessed modules (last 3)
	const recentModules = $derived.by(() => {
		return data.progress
			.filter((p) => p.status !== 'not_started')
			.slice(0, 3)
			.map((p) => {
				const module = data.modules.find((m) => m.id === p.moduleId);
				return module ? { ...module, progress: p } : null;
			})
			.filter((m) => m !== null);
	});
</script>

<div class="mx-auto max-w-3xl px-4 pt-8 pb-24">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-slate-900">Welcome back, {data.user.name}!</h1>
		<p class="mt-1 text-sm text-slate-500">Your mission prep journey</p>
	</div>

	<!-- Days until arrival (if set) -->
	{#if daysUntilArrival !== null}
		<Card.Root class="mb-6 border-blue-200 bg-blue-50">
			<Card.Content class="p-4">
				{@const days = daysUntilArrival}
				<div class="flex items-center gap-4">
					<div class="p-3 bg-blue-100 rounded-full">
						<Calendar class="w-6 h-6 text-blue-600" />
					</div>
					<div class="flex-1">
						<p class="text-sm text-blue-700">Departure Countdown</p>
						{#if days !== null}
							<p class="text-2xl font-bold text-blue-900">
								{#if days > 0}
									{days} days until you arrive in Japan
								{:else if days === 0}
									You're leaving today!
								{:else}
									Welcome to Japan!
								{/if}
							</p>
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root class="mb-6 border-amber-200 bg-amber-50">
			<Card.Content class="p-4">
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-4">
						<div class="p-3 bg-amber-100 rounded-full">
							<Calendar class="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<p class="text-sm font-semibold text-amber-900">Set Your Arrival Date</p>
							<p class="text-xs text-amber-700">Track your countdown to Japan</p>
						</div>
					</div>
					<Button variant="outline" href="/profile" class="flex items-center gap-2">
						Go to Profile
						<ArrowRight class="w-4 h-4" />
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Progress overview -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-sm font-semibold text-gray-700">Overall</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-3xl font-bold text-gray-900">{overallProgress}%</div>
				<p class="text-xs text-gray-600 mt-1">
					{completedModules} of {totalModules} modules
				</p>
				<Progress value={overallProgress} class="mt-3 h-2" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-sm font-semibold text-gray-700 flex items-center gap-2">
					<Badge variant="default">Tier 1</Badge>
					Pre-Arrival
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-3xl font-bold text-gray-900">{tier1Completed}/{tier1Modules.length}</div>
				<p class="text-xs text-gray-600 mt-1">modules completed</p>
				<Progress
					value={tier1Modules.length > 0 ? (tier1Completed / tier1Modules.length) * 100 : 0}
					class="mt-3 h-2"
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-sm font-semibold text-gray-700 flex items-center gap-2">
					<Badge variant="secondary">Tier 2</Badge>
					Ministry Prep
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-3xl font-bold text-gray-900">{tier2Completed}/{tier2Modules.length}</div>
				<p class="text-xs text-gray-600 mt-1">modules completed</p>
				<Progress
					value={tier2Modules.length > 0 ? (tier2Completed / tier2Modules.length) * 100 : 0}
					class="mt-3 h-2"
				/>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Next step -->
	{#if nextModule}
		{@const next = nextModule}
		{#if next}
			<Card.Root class="mb-6">
				<Card.Header>
					<Card.Title class="text-lg">Next Step: Continue Your Journey</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-2">
								<Badge variant={next.tier === 1 ? 'default' : 'secondary'}>
									Tier {next.tier}
								</Badge>
							</div>
							<h3 class="text-lg font-semibold text-gray-900 mb-1">{next.title}</h3>
							<div class="flex items-center gap-4 text-sm text-gray-600">
								<span class="flex items-center gap-1">
									<Clock class="w-4 h-4" />
									{next.estimatedMinutes} min
								</span>
							</div>
						</div>
						<Button href="/modules/{next.slug}" class="flex items-center gap-2">
							Start Now
							<ArrowRight class="w-4 h-4" />
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	{:else if completedModules === totalModules}
		<Card.Root class="mb-6 border-green-500 bg-green-50">
			<Card.Content class="p-6">
				<div class="flex items-center gap-4">
					<CheckCircle2 class="w-12 h-12 text-green-600" />
					<div>
						<h3 class="text-lg font-semibold text-green-900">All Modules Complete!</h3>
						<p class="text-sm text-green-700 mt-1">
							Congratulations! You've completed your preparation. You're ready for Japan! 🇯🇵
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Recently accessed -->
	{#if recentModules.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-lg">Recently Accessed</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each recentModules as item}
					<a
						href="/modules/{item.slug}"
						class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								<Badge variant={item.tier === 1 ? 'default' : 'secondary'}>Tier {item.tier}</Badge>
								{#if item.progress.status === 'completed'}
									<CheckCircle2 class="w-4 h-4 text-green-600" />
								{/if}
							</div>
							<p class="text-sm font-medium text-gray-900">{item.title}</p>
							{#if item.progress.status === 'in_progress'}
								<p class="text-xs text-gray-600 mt-1">
									Page {item.progress.currentPage + 1} of 7
								</p>
							{:else if item.progress.status === 'completed'}
								<p class="text-xs text-green-700 mt-1">Completed</p>
							{/if}
						</div>
						<ArrowRight class="w-4 h-4 text-gray-400" />
					</a>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Quick links -->
	<div class="mt-6 flex gap-4">
		<Button href="/modules" variant="outline" class="flex-1">View All Modules</Button>
		<Button href="/profile" variant="outline" class="flex-1">Edit Profile</Button>
	</div>
</div>
