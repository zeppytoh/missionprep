import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Component } from 'svelte';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Type helpers for shadcn-svelte components
type RestProps<T extends Record<string, any>> = Omit<T, 'children' | 'child'>;

export type WithElementRef<T extends Record<string, any>> = T & {
	ref?: HTMLElement | null;
};

export type WithoutChildrenOrChild<T extends Record<string, any>> = RestProps<T>;

export type WithoutChildren<T extends Record<string, any>> = RestProps<T>;

export type WithAsChild<T extends Record<string, any>> = T & {
	asChild?: boolean;
	el?: HTMLElement | null;
};
