import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userProgress, modules } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';
import type { ModulePage, QuizBlock } from '$lib/types/content';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { moduleId } = await request.json();

	if (typeof moduleId !== 'number') {
		return json({ error: 'Invalid request' }, { status: 400 });
	}

	try {
		// Get module to check if it has a quiz
		const [module] = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);

		if (!module) {
			return json({ error: 'Module not found' }, { status: 404 });
		}

		// Check if progress record exists
		const [existing] = await db
			.select()
			.from(userProgress)
			.where(and(eq(userProgress.userId, session.user.id), eq(userProgress.moduleId, moduleId)))
			.limit(1);

		if (!existing) {
			return json({ error: 'Progress not found. Start the module first.' }, { status: 400 });
		}

		// Validate completion requirements
		// Check if module has a completion quiz by looking at pages
		const pages = (module.pages as unknown as ModulePage[]) || [];
		const completionQuiz = pages
			.flatMap((page) => page.blocks)
			.find((block) => block.type === 'quiz' && (block as QuizBlock).isCompletionQuiz) as
			| QuizBlock
			| undefined;

		if (completionQuiz) {
			const passingScore = completionQuiz.passingScore || 70;

			// Check if quiz is passed
			if (!existing.quizScore || existing.quizScore < passingScore) {
				return json(
					{
						error: `You must pass the quiz with ${passingScore}% or higher. Current score: ${existing.quizScore || 0}%`
					},
					{ status: 400 }
				);
			}
		}

		// Update progress to completed
		await db
			.update(userProgress)
			.set({
				status: 'completed',
				completedAt: new Date()
			})
			.where(eq(userProgress.id, existing.id));

		return json({ success: true });
	} catch (error) {
		console.error('Error completing module:', error);
		return json({ error: 'Failed to complete module' }, { status: 500 });
	}
};
