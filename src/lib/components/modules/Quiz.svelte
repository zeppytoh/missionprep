<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-svelte';
	import type { QuizBlock } from '$lib/types/content';

	interface Props {
		quiz: QuizBlock;
		moduleId: number;
		onPass?: (score: number) => void;
	}

	let { quiz, moduleId, onPass }: Props = $props();

	// State
	let answers = $state<Record<string, string>>({});
	let submitted = $state(false);
	let score = $state(0);
	let attempts = $state(0);
	let hasEverPassed = $state(false);

	// Derived
	const allAnswered = $derived(
		quiz.questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== '')
	);
	const passed = $derived(submitted && score >= quiz.passingScore);
	const failed = $derived(submitted && score < quiz.passingScore);

	// Functions
	async function submitQuiz() {
		if (!allAnswered) return;

		// Calculate score
		let correct = 0;
		quiz.questions.forEach((q) => {
			if (answers[q.id] === q.correct) {
				correct++;
			}
		});

		score = Math.round((correct / quiz.questions.length) * 100);
		submitted = true;
		attempts++;

		// Save to database
		await fetch('/api/progress/submit-quiz', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				moduleId,
				score,
				attempts
			})
		});

		// Call onPass callback only on FIRST pass (not on retakes)
		if (score >= quiz.passingScore && onPass && !hasEverPassed) {
			hasEverPassed = true;
			onPass(score);
		}
	}

	function retakeQuiz() {
		answers = {};
		submitted = false;
		score = 0;
	}
</script>

<Card.Root class="border-indigo-200 bg-indigo-50">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-lg text-indigo-900 flex items-center gap-2">
				<AlertCircle class="w-5 h-5" />
				{quiz.isCompletionQuiz ? 'Module Quiz' : 'Knowledge Check'}
			</Card.Title>
			{#if quiz.isCompletionQuiz}
				<Badge variant="default">Required to Complete</Badge>
			{/if}
		</div>
		<p class="text-sm text-indigo-700 mt-1">
			Passing score: {quiz.passingScore}%
			{#if attempts > 0}
				<span class="ml-2">(Attempt #{attempts + 1})</span>
			{/if}
		</p>
	</Card.Header>

	<Card.Content class="space-y-6">
		{#each quiz.questions as question, qIndex}
			<div class="bg-white p-4 rounded-lg border border-indigo-100">
				<!-- Question -->
				<div class="flex items-start gap-3 mb-3">
					<span class="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
						{qIndex + 1}
					</span>
					<div class="flex-1 text-gray-900 font-medium prose prose-sm max-w-none">
						{@html question.question}
					</div>
				</div>

				<!-- Options -->
				<div class="space-y-2 ml-9">
					{#each question.options as option}
						{@const isSelected = answers[question.id] === option.id}
						{@const isCorrect = option.id === question.correct}
						{@const showFeedback = submitted}

						<label
							class="flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer
              {isSelected && !showFeedback ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}
              {showFeedback && isCorrect ? 'border-green-500 bg-green-50' : ''}
              {showFeedback && isSelected && !isCorrect ? 'border-red-500 bg-red-50' : ''}
              {submitted ? 'cursor-default' : ''}"
						>
							<input
								type="radio"
								name={question.id}
								value={option.id}
								bind:group={answers[question.id]}
								disabled={submitted}
								class="mt-0.5 text-indigo-600 focus:ring-indigo-500"
							/>

							<div class="flex-1">
								<div class="flex items-center gap-2">
									<div class="text-gray-900 prose prose-sm max-w-none [&>p]:inline [&>p]:m-0">
										{@html option.text}
									</div>
									{#if showFeedback && isCorrect}
										<CheckCircle2 class="w-5 h-5 text-green-600 flex-shrink-0" />
									{:else if showFeedback && isSelected && !isCorrect}
										<XCircle class="w-5 h-5 text-red-600 flex-shrink-0" />
									{/if}
								</div>
							</div>
						</label>
					{/each}
				</div>

				<!-- Explanation (shown after submission) -->
				{#if submitted}
					<div class="mt-3 ml-9 p-3 bg-blue-50 border border-blue-100 rounded-lg">
						<div class="text-sm text-blue-900 prose prose-sm max-w-none">
							<strong>Explanation:</strong>
							{@html question.explanation}
						</div>
					</div>
				{/if}
			</div>
		{/each}

		<!-- Submit / Results section -->
		<div class="border-t border-indigo-200 pt-4">
			{#if !submitted}
				<div class="flex items-center justify-between">
					<p class="text-sm text-gray-600">
						{allAnswered ? 'All questions answered' : `${Object.keys(answers).length} of ${quiz.questions.length} answered`}
					</p>
					<Button onclick={submitQuiz} disabled={!allAnswered}>
						Submit Quiz
					</Button>
				</div>
			{:else}
				<!-- Results -->
				<div class="space-y-4">
					<div
						class="p-4 rounded-lg border-2 {passed
							? 'bg-green-50 border-green-500'
							: 'bg-red-50 border-red-500'}"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								{#if passed}
									<CheckCircle2 class="w-8 h-8 text-green-600" />
									<div>
										<h4 class="text-lg font-semibold text-green-900">Passed!</h4>
										<p class="text-sm text-green-700">Great work! You scored {score}%</p>
									</div>
								{:else}
									<XCircle class="w-8 h-8 text-red-600" />
									<div>
										<h4 class="text-lg font-semibold text-red-900">Not quite there</h4>
										<p class="text-sm text-red-700">
											You scored {score}%. Need {quiz.passingScore}% to pass.
										</p>
									</div>
								{/if}
							</div>

							{#if !passed}
								<Button variant="outline" onclick={retakeQuiz} class="flex items-center gap-2">
									<RotateCcw class="w-4 h-4" />
									Retake
								</Button>
							{/if}
						</div>
					</div>

					{#if passed && quiz.isCompletionQuiz}
						<p class="text-sm text-green-700 text-center">
							✓ You've met the quiz requirement to complete this module
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
