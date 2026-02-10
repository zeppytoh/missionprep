import type { ModuleStatus } from '$lib/types/content';

/**
 * Module with prerequisite information
 */
export interface ModuleWithPrerequisites {
	id: number;
	slug: string;
	prerequisites: string[]; // Array of prerequisite module slugs
}

/**
 * User progress record for a module
 */
export interface UserProgressRecord {
	moduleId: number;
	status: ModuleStatus;
}

/**
 * Check if a user can access a module based on prerequisite completion
 *
 * @param module - The module to check access for
 * @param allModules - All available modules (needed to map slugs to IDs)
 * @param userProgress - User's progress records across all modules
 * @returns true if user can access the module, false otherwise
 *
 * @example
 * ```ts
 * const canAccess = canAccessModule(
 *   culturalSensitivityModule,
 *   allModules,
 *   userProgress
 * );
 * // Returns true if 'why-japan-challenging' is completed
 * ```
 */
export function canAccessModule(
	module: ModuleWithPrerequisites,
	allModules: ModuleWithPrerequisites[],
	userProgress: UserProgressRecord[]
): boolean {
	// If module has no prerequisites, it's always accessible
	if (!module.prerequisites || module.prerequisites.length === 0) {
		return true;
	}

	// Map prerequisite slugs to module IDs
	const prerequisiteIds = module.prerequisites
		.map((slug) => {
			const prereqModule = allModules.find((m) => m.slug === slug);
			return prereqModule?.id;
		})
		.filter((id): id is number => id !== undefined);

	// Check if all prerequisites are completed
	return prerequisiteIds.every((prereqId) => {
		const progress = userProgress.find((p) => p.moduleId === prereqId);
		return progress && progress.status === 'completed';
	});
}

/**
 * Get the status of a module for display purposes
 *
 * @param module - The module to get status for
 * @param allModules - All available modules
 * @param userProgress - User's progress records
 * @returns Status: 'locked', 'not_started', 'in_progress', or 'completed'
 *
 * @example
 * ```ts
 * const status = getModuleStatus(module, allModules, userProgress);
 * // Returns 'locked' if prerequisites not met
 * // Returns user's actual status otherwise
 * ```
 */
export function getModuleStatus(
	module: ModuleWithPrerequisites,
	allModules: ModuleWithPrerequisites[],
	userProgress: UserProgressRecord[]
): 'locked' | ModuleStatus {
	const canAccess = canAccessModule(module, allModules, userProgress);

	if (!canAccess) {
		return 'locked';
	}

	const progress = userProgress.find((p) => p.moduleId === module.id);
	return progress?.status || 'not_started';
}

/**
 * Get the names of incomplete prerequisite modules
 *
 * @param module - The module to check prerequisites for
 * @param allModules - All available modules
 * @param userProgress - User's progress records
 * @returns Array of incomplete prerequisite module titles
 *
 * @example
 * ```ts
 * const incomplete = getIncompletePrerequisites(module, allModules, userProgress);
 * // Returns ["Why Japan Is Challenging"] if that prerequisite is incomplete
 * ```
 */
export function getIncompletePrerequisites(
	module: ModuleWithPrerequisites,
	allModules: ModuleWithPrerequisites[],
	userProgress: UserProgressRecord[]
): string[] {
	if (!module.prerequisites || module.prerequisites.length === 0) {
		return [];
	}

	return module.prerequisites
		.map((slug) => {
			const prereqModule = allModules.find((m) => m.slug === slug);
			if (!prereqModule) return null;

			const progress = userProgress.find((p) => p.moduleId === prereqModule.id);
			const isComplete = progress && progress.status === 'completed';

			return isComplete ? null : prereqModule.slug;
		})
		.filter((slug): slug is string => slug !== null);
}
