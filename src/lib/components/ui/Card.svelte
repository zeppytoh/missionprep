<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		padding = 'md',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const baseStyles = 'bg-white border border-gray-200 rounded-lg shadow-sm';

	const paddings = {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};

	const cardClass = `${baseStyles} ${paddings[padding]} ${className}`;
</script>

<div class={cardClass} {...rest}>
	{@render children()}
</div>
