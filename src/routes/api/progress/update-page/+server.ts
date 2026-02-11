import { json, error as httpError } from '@sveltejs/kit';
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

	const { moduleId, currentPage } = await request.json();

	if (typeof moduleId !== 'number' || typeof currentPage !== 'number') {
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
			// Update existing progress
			await db
				.update(userProgress)
				.set({
					currentPage,
					status: 'in_progress'
				})
				.where(eq(userProgress.id, existing.id));
		} else {
			// Create new progress record
			await db.insert(userProgress).values({
				userId: session.user.id,
				moduleId,
				currentPage,
				status: 'in_progress',
				startedAt: new Date()
			});
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error updating page progress:', error);
		return json({ error: 'Failed to update progress' }, { status: 500 });
	}
};
