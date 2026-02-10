import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseModule } from './parse-module';
import 'dotenv/config';

// Create database connection for seed script (can't use SvelteKit's $env)
if (!process.env.DATABASE_URL) {
	console.error('❌ DATABASE_URL environment variable is required');
	process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

/**
 * Seed modules from markdown files into database
 */
async function seedModules() {
	console.log('🌱 Seeding modules...\n');

	const contentDir = join(process.cwd(), 'content', 'modules');
	let files: string[];

	try {
		files = readdirSync(contentDir).filter(
			(file) => file.endsWith('.md') && !file.startsWith('_') && !file.startsWith('README')
		);
	} catch (error) {
		console.error(`❌ Error reading content directory: ${contentDir}`);
		console.error('   Make sure app/content/modules/ exists with markdown files');
		process.exit(1);
	}

	if (files.length === 0) {
		console.warn('⚠️  No module files found in content/modules/');
		console.warn('   Add .md files to app/content/modules/ and run again');
		process.exit(0);
	}

	console.log(`Found ${files.length} module file(s):\n`);

	let seeded = 0;
	let updated = 0;
	let errors = 0;

	for (const file of files) {
		const filePath = join(contentDir, file);
		console.log(`📄 Processing: ${file}`);

		try {
			const markdown = readFileSync(filePath, 'utf-8');
			const parsed = parseModule(markdown);

			// Check if module exists
			const existing = await db.query.modules.findFirst({
				where: eq(schema.modules.slug, parsed.metadata.slug)
			});

			if (existing) {
				// Update existing module
				await db
					.update(schema.modules)
					.set({
						title: parsed.metadata.title,
						tier: parsed.metadata.tier,
						orderIndex: parsed.metadata.order,
						estimatedMinutes: parsed.metadata.estimatedMinutes,
						prerequisites: parsed.metadata.prerequisites,
						pages: parsed.pages as any // JSONB
					})
					.where(eq(schema.modules.id, existing.id));

				console.log(`   ✅ Updated: ${parsed.metadata.slug} (${parsed.pages.length} pages)`);
				updated++;
			} else {
				// Insert new module
				await db.insert(schema.modules).values({
					slug: parsed.metadata.slug,
					title: parsed.metadata.title,
					tier: parsed.metadata.tier,
					orderIndex: parsed.metadata.order,
					estimatedMinutes: parsed.metadata.estimatedMinutes,
					description: '', // TODO: Add description to frontmatter
					prerequisites: parsed.metadata.prerequisites,
					pages: parsed.pages as any // JSONB
				});

				console.log(`   ✅ Created: ${parsed.metadata.slug} (${parsed.pages.length} pages)`);
				seeded++;
			}
		} catch (error) {
			console.error(`   ❌ Error processing ${file}:`);
			console.error(`      ${error instanceof Error ? error.message : String(error)}`);
			errors++;
		}

		console.log('');
	}

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(`📊 Seeding complete:`);
	console.log(`   Created: ${seeded}`);
	console.log(`   Updated: ${updated}`);
	console.log(`   Errors:  ${errors}`);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

	if (errors > 0) {
		process.exit(1);
	}
}

// Run seeder
seedModules()
	.catch((error) => {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
