<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

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

			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					placeholder="Your full name"
				/>
			</div>

			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-slate-700">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="8"
					class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					placeholder="At least 8 characters"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? 'Creating account...' : 'Create account'}
			</button>
		</form>

		<p class="mt-6 text-center text-sm text-slate-500">
			Already have an account?
			<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
		</p>
	</div>
</div>
