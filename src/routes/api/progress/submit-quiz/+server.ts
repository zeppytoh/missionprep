import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userProgress } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { moduleId, score, attempts } = await request.json();

	if (typeof moduleId !== 'number' || typeof score !== 'number') {
		return json({ error: 'Invalid request' }, { status: 400 });
	}

	try {
		// Check if progress record exists
		const [existing] = await db
			.select()
			.from(userProgress)
			.where(and(eq(userProgress.userId, session.user.id), eq(userProgress.moduleId, moduleId)))
			.limit(1);

		if (existing) {
			// Update existing progress with quiz score
			await db
				.update(userProgress)
				.set({
					quizScore: score,
					quizAttempts: attempts || existing.quizAttempts + 1
				})
				.where(eq(userProgress.id, existing.id));
		} else {
			// Create new progress record with quiz score
			await db.insert(userProgress).values({
				userId: session.user.id,
				moduleId,
				status: 'in_progress',
				quizScore: score,
				quizAttempts: attempts || 1,
				startedAt: new Date()
			});
		}

		return json({ success: true, score });
	} catch (error) {
		console.error('Error submitting quiz:', error);
		return json({ error: 'Failed to submit quiz' }, { status: 500 });
	}
};
