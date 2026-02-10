<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-lg px-4 pt-8">
	<h1 class="text-2xl font-bold text-slate-900">Profile</h1>
	<p class="mt-1 text-sm text-slate-500">Manage your account</p>

	<div class="mt-8 rounded-xl border border-slate-200 bg-white p-5">
		<div class="space-y-3 text-sm">
			<div>
				<span class="font-medium text-slate-700">Name:</span>
				<span class="text-slate-500">{data.user.name}</span>
			</div>
			<div>
				<span class="font-medium text-slate-700">Email:</span>
				<span class="text-slate-500">{data.user.email}</span>
			</div>
		</div>
	</div>
</div>
