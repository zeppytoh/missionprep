import { pgTable, text, timestamp, boolean, integer, jsonb, serial } from 'drizzle-orm/pg-core';

// ── Better Auth tables ──────────────────────────────────────

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	// App-specific fields
	arrivalDate: timestamp('arrival_date'),
	role: text('role').notNull().default('student')
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id)
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// ── App tables ──────────────────────────────────────────────

/**
 * Module pages follow a 7-section structure:
 * 1. Unit Introduction (video + outcomes)
 * 2. Section 1 (inquiry-based lesson)
 * 3. Section 2 (inquiry-based lesson)
 * 4. Section 3 (case studies / interactive)
 * 5. Section 4 (practical reference)
 * 6. Lesson Summary
 * 7. Prayer Guide (can embed external content)
 *
 * Each page contains typed content blocks:
 * text, info-box, video, key-point, activity, case-study,
 * quiz-inline, reflection, embed
 */
export const modules = pgTable('modules', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	tier: integer('tier').notNull(), // 1 or 2
	orderIndex: integer('order_index').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	estimatedMinutes: integer('estimated_minutes').notNull(),
	prerequisites: text('prerequisites').array().notNull().default([]),
	pages: jsonb('pages').notNull().default([]), // array of 7 page objects
	quiz: jsonb('quiz'), // quiz config (questions, pass threshold)
	reflections: jsonb('reflections') // reflection prompts config
});

export const userProgress = pgTable('user_progress', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	moduleId: integer('module_id')
		.notNull()
		.references(() => modules.id),
	status: text('status').notNull().default('not_started'), // not_started, in_progress, completed
	currentPage: integer('current_page').notNull().default(0),
	quizScore: integer('quiz_score'),
	quizAttempts: integer('quiz_attempts').notNull().default(0),
	reflectionsData: jsonb('reflections_data').default({}),
	startedAt: timestamp('started_at'),
	completedAt: timestamp('completed_at')
});
