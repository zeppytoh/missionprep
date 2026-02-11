import { db } from '$lib/server/db';
import { modules, userProgress } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();
	const { slug } = params;

	// Fetch module by slug
	const [module] = await db
		.select()
		.from(modules)
		.where(eq(modules.slug, slug))
		.limit(1);

	if (!module) {
		throw error(404, 'Module not found');
	}

	// Fetch user progress for this module
	const [progress] = await db
		.select()
		.from(userProgress)
		.where(and(eq(userProgress.userId, user.id), eq(userProgress.moduleId, module.id)))
		.limit(1);

	return {
		module,
		progress: progress || null
	};
};
