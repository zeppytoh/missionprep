import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userProgress } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { moduleId, reflectionId, value } = await request.json();

	if (typeof moduleId !== 'number' || typeof reflectionId !== 'string') {
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
			// Update existing reflections data using JSONB merge
			const currentReflections = (existing.reflectionsData as Record<string, string>) || {};
			const updatedReflections = {
				...currentReflections,
				[reflectionId]: value
			};

			await db
				.update(userProgress)
				.set({
					reflectionsData: updatedReflections
				})
				.where(eq(userProgress.id, existing.id));
		} else {
			// Create new progress record with reflection
			await db.insert(userProgress).values({
				userId: session.user.id,
				moduleId,
				status: 'in_progress',
				reflectionsData: { [reflectionId]: value },
				startedAt: new Date()
			});
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error saving reflection:', error);
		return json({ error: 'Failed to save reflection' }, { status: 500 });
	}
};
