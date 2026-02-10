import { db } from '$lib/server/db';
import { modules, userProgress } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Fetch all modules ordered by tier and order
	const allModules = await db
		.select({
			id: modules.id,
			slug: modules.slug,
			tier: modules.tier,
			orderIndex: modules.orderIndex,
			title: modules.title,
			description: modules.description,
			estimatedMinutes: modules.estimatedMinutes,
			prerequisites: modules.prerequisites
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
			completedAt: userProgress.completedAt
		})
		.from(userProgress)
		.where(eq(userProgress.userId, user.id));

	return {
		modules: allModules,
		progress
	};
};
