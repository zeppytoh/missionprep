<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		disabled = false,
		type = 'button',
		children,
		...rest
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

	const variants = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
		secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-600',
		outline:
			'border-2 border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-600',
		ghost: 'bg-transparent hover:bg-gray-100 focus-visible:ring-gray-600',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600'
	};

	const sizes = {
		sm: 'h-8 px-3 text-sm rounded',
		md: 'h-10 px-4 text-base rounded-md',
		lg: 'h-12 px-6 text-lg rounded-lg'
	};

	const buttonClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
</script>

<button {type} {disabled} class={buttonClass} {...rest}>
	{@render children()}
</button>
