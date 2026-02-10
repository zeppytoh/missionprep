<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-lg px-4 pt-8">
	<h1 class="text-2xl font-bold text-slate-900">Welcome, {data.user.name}</h1>
	<p class="mt-1 text-sm text-slate-500">Your mission prep dashboard</p>

	<!-- Placeholder sections for Phase 2 -->
	<div class="mt-8 space-y-4">
		<div class="rounded-xl border border-slate-200 bg-white p-5">
			<h2 class="text-sm font-semibold text-slate-700">Overall Progress</h2>
			<div class="mt-3 h-2 w-full rounded-full bg-slate-100">
				<div class="h-2 rounded-full bg-blue-600" style="width: 0%"></div>
			</div>
			<p class="mt-2 text-xs text-slate-400">0 of 10 modules completed</p>
		</div>

		<div class="rounded-xl border border-slate-200 bg-white p-5">
			<h2 class="text-sm font-semibold text-slate-700">Next Step</h2>
			<p class="mt-1 text-sm text-slate-500">Complete Module 1: Welcome & Orientation to get started.</p>
		</div>
	</div>
</div>
