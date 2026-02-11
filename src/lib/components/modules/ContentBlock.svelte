<script lang="ts">
	import type { ContentBlock } from '$lib/types/content';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Info, Lightbulb, Video, FileText } from 'lucide-svelte';
	import Quiz from './Quiz.svelte';
	import Reflection from './Reflection.svelte';

	interface Props {
		block: ContentBlock;
		moduleId?: number;
		reflectionsData?: Record<string, string>;
	}

	let { block, moduleId, reflectionsData = {} }: Props = $props();

	function formatDuration(seconds?: number): string {
		if (!seconds) return '';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="my-6">
	{#if block.type === 'text'}
		<div class="space-y-3">
			{#if block.heading}
				<h3 class="text-lg font-semibold text-gray-900">{block.heading}</h3>
			{/if}
			<!-- Render markdown/HTML body -->
			<div class="prose prose-slate max-w-none">
				{@html block.body}
			</div>
		</div>
	{:else if block.type === 'video'}
		<div class="space-y-3">
			{#if block.title}
				<div class="flex items-center gap-2">
					<Video class="w-5 h-5 text-blue-600" />
					<h3 class="text-lg font-semibold text-gray-900">{block.title}</h3>
					{#if block.duration}
						<Badge variant="secondary">{formatDuration(block.duration)}</Badge>
					{/if}
				</div>
			{/if}
			<div class="aspect-video rounded-lg overflow-hidden bg-gray-100">
				<iframe
					src={block.url}
					title={block.title || 'Video'}
					class="w-full h-full border-0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
					referrerpolicy="strict-origin-when-cross-origin"
					loading="lazy"
				></iframe>
			</div>
		</div>
	{:else if block.type === 'info-box'}
		<Card.Root class="border-blue-200 bg-blue-50">
			<Card.Content class="p-4">
				<div class="flex gap-3">
					<Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
					<div class="flex-1">
						{#if block.heading}
							<h4 class="font-semibold text-blue-900 mb-2">{block.heading}</h4>
						{/if}
						<div class="text-sm text-blue-800 prose prose-blue prose-sm max-w-none">
							{@html block.content}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if block.type === 'key-point'}
		<Card.Root class="border-amber-200 bg-amber-50">
			<Card.Content class="p-4">
				<div class="flex gap-3">
					<Lightbulb class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
					<div class="flex-1">
						{#if block.heading}
							<h4 class="font-semibold text-amber-900 mb-2">{block.heading}</h4>
						{/if}
						<div class="text-sm text-amber-800 prose prose-amber prose-sm max-w-none">
							{@html block.content}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if block.type === 'activity'}
		<Card.Root class="border-purple-200 bg-purple-50">
			<Card.Header>
				<Card.Title class="text-lg text-purple-900 flex items-center gap-2">
					<FileText class="w-5 h-5" />
					{block.title}
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#if block.setup}
					<div>
						<h4 class="font-semibold text-purple-900 mb-1">Setup</h4>
						<div class="text-sm text-purple-800 prose prose-purple prose-sm max-w-none">
							{@html block.setup}
						</div>
					</div>
				{/if}
				{#if block.investigation}
					<div>
						<h4 class="font-semibold text-purple-900 mb-1">Investigation</h4>
						<div class="text-sm text-purple-800 prose prose-purple prose-sm max-w-none">
							{@html block.investigation}
						</div>
					</div>
				{/if}
				{#if block.discovery}
					<div>
						<h4 class="font-semibold text-purple-900 mb-1">Discovery</h4>
						<div class="text-sm text-purple-800 prose prose-purple prose-sm max-w-none">
							{@html block.discovery}
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else if block.type === 'case-study'}
		<Card.Root class="border-teal-200 bg-teal-50">
			<Card.Header>
				<Card.Title class="text-lg text-teal-900">{block.title}</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#if block.situation}
					<div>
						<h4 class="font-semibold text-teal-900 mb-1">Situation</h4>
						<div class="text-sm text-teal-800 prose prose-teal prose-sm max-w-none">
							{@html block.situation}
						</div>
					</div>
				{/if}
				{#if block.diagnosis}
					<div>
						<h4 class="font-semibold text-teal-900 mb-1">Diagnosis</h4>
						<div class="text-sm text-teal-800 prose prose-teal prose-sm max-w-none">
							{@html block.diagnosis}
						</div>
					</div>
				{/if}
				{#if block.solution}
					<div>
						<h4 class="font-semibold text-teal-900 mb-1">Solution</h4>
						<div class="text-sm text-teal-800 prose prose-teal prose-sm max-w-none">
							{@html block.solution}
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else if block.type === 'embed'}
		<div class="space-y-3">
			{#if block.title}
				<h3 class="text-lg font-semibold text-gray-900">{block.title}</h3>
			{/if}
			<div class="rounded-lg overflow-hidden bg-gray-100" style="height: {block.height || 600}px">
				<iframe src={block.url} title={block.title || 'Embedded content'} class="w-full h-full"
				></iframe>
			</div>
		</div>
	{:else if block.type === 'quiz'}
		{#if moduleId}
			<Quiz quiz={block} {moduleId} />
		{:else}
			<div class="text-sm text-red-500 italic">
				Quiz block requires moduleId prop
			</div>
		{/if}
	{:else if block.type === 'reflection'}
		{#if moduleId}
			<Reflection
				reflection={block}
				{moduleId}
				initialValue={reflectionsData[block.id] || ''}
			/>
		{:else}
			<div class="bg-amber-50 border border-amber-200 p-4 rounded-lg">
				<p class="text-sm text-amber-800 italic">
					💭 Reflection requires moduleId prop
				</p>
			</div>
		{/if}
	{/if}
</div>
