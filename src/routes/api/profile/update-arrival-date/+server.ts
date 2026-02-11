import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { arrivalDate } = await request.json();

	if (!arrivalDate) {
		return json({ error: 'Arrival date is required' }, { status: 400 });
	}

	// Validate date format
	const date = new Date(arrivalDate);
	if (isNaN(date.getTime())) {
		return json({ error: 'Invalid date format' }, { status: 400 });
	}

	try {
		// Update user's arrival date
		await db.update(user).set({ arrivalDate: date }).where(eq(user.id, session.user.id));

		return json({ success: true });
	} catch (error) {
		console.error('Error updating arrival date:', error);
		return json({ error: 'Failed to update arrival date' }, { status: 500 });
	}
};
