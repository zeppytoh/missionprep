<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister() {
		error = '';
		loading = true;
		const result = await authClient.signUp.email({ email, password, name });
		loading = false;

		if (result.error) {
			error = result.error.message ?? 'Registration failed';
		} else {
			goto('/dashboard');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-sm">
		<h1 class="mb-2 text-center text-2xl font-bold text-slate-900">Create Account</h1>
		<p class="mb-8 text-center text-sm text-slate-500">Start your mission prep journey</p>

		<form onsubmit={handleRegister} class="space-y-4">
			{#if error}
				<div class="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
			{/if}

			<div class="space-y-2">
				<Label for="name">Full Name</Label>
				<Input
					id="name"
					type="text"
					bind:value={name}
					required
					placeholder="Your full name"
				/>
			</div>

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
					minlength={8}
					placeholder="At least 8 characters"
				/>
			</div>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating account...' : 'Create account'}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm text-slate-500">
			Already have an account?
			<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
		</p>
	</div>
</div>
