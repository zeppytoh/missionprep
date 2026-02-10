<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { House, BookOpen, User, LogOut } from 'lucide-svelte';

	let { children } = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Home', icon: House },
		{ href: '/modules', label: 'Modules', icon: BookOpen },
		{ href: '/profile', label: 'Profile', icon: User }
	];

	async function handleLogout() {
		await authClient.signOut();
		goto('/login');
	}
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
	<!-- Main content -->
	<main class="flex-1 pb-20">
		{@render children()}
	</main>

	<!-- Bottom nav (mobile-first) -->
	<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white">
		<div class="mx-auto flex max-w-lg items-center justify-around py-2">
			{#each navItems as item}
				{@const active = page.url.pathname.startsWith(item.href)}
				<a
					href={item.href}
					class="flex flex-col items-center gap-0.5 px-3 py-1 text-xs {active
						? 'text-blue-600'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					<item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
					{item.label}
				</a>
			{/each}
			<button
				onclick={handleLogout}
				class="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-slate-400 hover:text-slate-600"
			>
				<LogOut size={20} strokeWidth={1.5} />
				Sign out
			</button>
		</div>
	</nav>
</div>
