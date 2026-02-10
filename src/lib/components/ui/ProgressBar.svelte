<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: number; // 0-100
		max?: number;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'success' | 'warning' | 'danger';
		showLabel?: boolean;
	}

	let {
		value,
		max = 100,
		size = 'md',
		variant = 'default',
		showLabel = false,
		class: className = '',
		...rest
	}: Props = $props();

	const percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));

	const baseStyles = 'w-full bg-gray-200 rounded-full overflow-hidden';

	const sizes = {
		sm: 'h-1',
		md: 'h-2',
		lg: 'h-3'
	};

	const variants = {
		default: 'bg-blue-600',
		success: 'bg-green-600',
		warning: 'bg-yellow-600',
		danger: 'bg-red-600'
	};

	const containerClass = `${baseStyles} ${sizes[size]} ${className}`;
	const barClass = `h-full transition-all duration-300 ${variants[variant]}`;
</script>

<div>
	<div class={containerClass} {...rest}>
		<div class={barClass} style="width: {percentage}%"></div>
	</div>
	{#if showLabel}
		<div class="mt-1 text-sm text-gray-600 text-right">
			{Math.round(percentage)}%
		</div>
	{/if}
</div>
