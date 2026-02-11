import { db } from '$lib/server/db';
import { modules, userProgress } from '$lib/server/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Fetch all modules
	const allModules = await db
		.select({
			id: modules.id,
			slug: modules.slug,
			title: modules.title,
			tier: modules.tier,
			orderIndex: modules.orderIndex,
			prerequisites: modules.prerequisites,
			estimatedMinutes: modules.estimatedMinutes
		})
		.from(modules)
		.orderBy(asc(modules.tier), asc(modules.orderIndex));

	// Fetch user's progress
	const progress = await db
		.select({
			id: userProgress.id,
			moduleId: userProgress.moduleId,
			status: userProgress.status,
			currentPage: userProgress.currentPage,
			quizScore: userProgress.quizScore,
			completedAt: userProgress.completedAt,
			startedAt: userProgress.startedAt
		})
		.from(userProgress)
		.where(eq(userProgress.userId, user.id))
		.orderBy(desc(userProgress.startedAt));

	return {
		user,
		modules: allModules,
		progress
	};
};
