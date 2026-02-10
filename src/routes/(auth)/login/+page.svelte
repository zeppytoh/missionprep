<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		error = '';
		loading = true;
		const result = await authClient.signIn.email({ email, password });
		loading = false;

		if (result.error) {
			error = result.error.message ?? 'Login failed';
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-sm">
		<h1 class="mb-2 text-center text-2xl font-bold text-slate-900">Mission Prep</h1>
		<p class="mb-8 text-center text-sm text-slate-500">Prepare for your journey to Japan</p>

		<form onsubmit={handleLogin} class="space-y-4">
			{#if error}
				<div class="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
			{/if}

			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="you@example.com"
				/>
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					required
					placeholder="••••••••"
				/>
			</div>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Signing in...' : 'Sign in'}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm text-slate-500">
			Don't have an account?
			<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">Register</a>
		</p>
	</div>
</div>
