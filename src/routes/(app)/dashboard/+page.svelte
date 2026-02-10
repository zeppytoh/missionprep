<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-lg px-4 pt-8">
	<h1 class="text-2xl font-bold text-slate-900">Welcome, {data.user.name}</h1>
	<p class="mt-1 text-sm text-slate-500">Your mission prep dashboard</p>

	<!-- Placeholder sections for Phase 2 -->
	<div class="mt-8 space-y-4">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-semibold">Overall Progress</Card.Title>
			</Card.Header>
			<Card.Content>
				<Progress value={0} class="mt-3" />
				<p class="mt-2 text-xs text-muted-foreground">0 of 10 modules completed</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-sm font-semibold">Next Step</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">
					Complete Module 1: Welcome & Orientation to get started.
				</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
