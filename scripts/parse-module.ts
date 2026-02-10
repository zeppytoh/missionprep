import matter from 'gray-matter';
import type {
	ParsedModule,
	ModulePage,
	ContentBlock,
	QuizQuestion
} from '../src/lib/types/content';

/**
 * Parse a module markdown file into structured JSONB data
 */
export function parseModule(markdown: string): ParsedModule {
	// 1. Extract frontmatter
	const { data: frontmatter, content } = matter(markdown);

	const metadata = {
		slug: frontmatter.slug,
		title: frontmatter.title,
		tier: frontmatter.tier,
		order: frontmatter.order,
		estimatedMinutes: frontmatter.estimatedMinutes || 30,
		prerequisites: frontmatter.prerequisites || []
	};

	// 2. Split content into pages by "## Page N:" markers
	const pages = splitIntoPages(content);

	return { metadata, pages };
}

/**
 * Split markdown content into pages based on "## Page N:" headings
 */
function splitIntoPages(content: string): ModulePage[] {
	const pageRegex = /^## Page (\d+):\s*(.+)$/gm;
	const pages: ModulePage[] = [];
	let match;
	let lastIndex = 0;

	const matches: Array<{ index: number; pageNum: number; title: string }> = [];

	// Find all page markers
	while ((match = pageRegex.exec(content)) !== null) {
		matches.push({
			index: match.index,
			pageNum: parseInt(match[1]),
			title: match[2].trim()
		});
	}

	// Parse each page section
	for (let i = 0; i < matches.length; i++) {
		const current = matches[i];
		const next = matches[i + 1];
		const start = current.index + content.slice(current.index).indexOf('\n') + 1;
		const end = next ? next.index : content.length;
		const pageContent = content.slice(start, end).trim();

		// Determine page type from page number
		let pageType:
			| 'introduction'
			| 'section'
			| 'case-study'
			| 'reference'
			| 'summary'
			| 'prayer-guide' = 'section';
		if (current.pageNum === 1) pageType = 'introduction';
		else if (current.pageNum === 4) pageType = 'case-study';
		else if (current.pageNum === 5) pageType = 'reference';
		else if (current.pageNum === 6) pageType = 'summary';
		else if (current.pageNum === 7) pageType = 'prayer-guide';

		pages.push({
			id: `page-${current.pageNum}`,
			title: current.title,
			pageType,
			blocks: parseBlocks(pageContent)
		});
	}

	return pages;
}

/**
 * Parse content blocks from page content
 * Recognizes :::directive{attrs} ... ::: syntax
 */
function parseBlocks(content: string): ContentBlock[] {
	const blocks: ContentBlock[] = [];
	const lines = content.split('\n');
	let i = 0;

	while (i < lines.length) {
		const line = lines[i].trim();

		// Check for directive block
		if (line.startsWith(':::')) {
			const { block, endIndex } = parseDirectiveBlock(lines, i);
			if (block) {
				blocks.push(block);
				i = endIndex + 1;
				continue;
			}
		}

		// Plain text accumulation
		if (line.length > 0 && !line.startsWith(':::')) {
			let textContent = line;
			i++;
			while (i < lines.length && !lines[i].trim().startsWith(':::')) {
				textContent += '\n' + lines[i];
				i++;
			}

			if (textContent.trim()) {
				blocks.push({
					type: 'text',
					body: textContent.trim()
				});
			}
			continue;
		}

		i++;
	}

	return blocks;
}

/**
 * Parse a single :::directive{attrs} ... ::: block
 */
function parseDirectiveBlock(
	lines: string[],
	startIndex: number
): { block: ContentBlock | null; endIndex: number } {
	const openLine = lines[startIndex].trim();
	const directiveMatch = openLine.match(/^:::(\w+(?:-\w+)?)\s*(\{[^}]+\})?/);

	if (!directiveMatch) {
		return { block: null, endIndex: startIndex };
	}

	const blockType = directiveMatch[1];
	const attrsStr = directiveMatch[2];
	const attrs = attrsStr ? parseAttributes(attrsStr) : {};

	// Find closing :::
	let endIndex = startIndex + 1;
	while (endIndex < lines.length && !lines[endIndex].trim().startsWith(':::')) {
		endIndex++;
	}

	const blockContent = lines
		.slice(startIndex + 1, endIndex)
		.join('\n')
		.trim();

	// Parse based on block type
	switch (blockType) {
		case 'text':
			return {
				block: {
					type: 'text',
					heading: attrs.heading,
					body: blockContent
				},
				endIndex
			};

		case 'video':
			return {
				block: {
					type: 'video',
					url: attrs.url || '',
					title: attrs.title,
					duration: attrs.duration ? parseInt(attrs.duration) : undefined
				},
				endIndex
			};

		case 'info-box':
			return {
				block: {
					type: 'info-box',
					heading: attrs.heading,
					content: blockContent
				},
				endIndex
			};

		case 'key-point':
			return {
				block: {
					type: 'key-point',
					heading: attrs.heading,
					content: blockContent
				},
				endIndex
			};

		case 'activity':
			return {
				block: {
					type: 'activity',
					title: attrs.title || 'Activity',
					...parseActivityContent(blockContent)
				},
				endIndex
			};

		case 'case-study':
			return {
				block: {
					type: 'case-study',
					title: attrs.title || 'Case Study',
					...parseCaseStudyContent(blockContent)
				},
				endIndex
			};

		case 'quiz':
			return {
				block: {
					type: 'quiz',
					questions: parseQuizQuestions(blockContent),
					passingScore: attrs.passingScore ? parseInt(attrs.passingScore) : 70,
					isCompletionQuiz: attrs.isCompletionQuiz === 'true' || attrs.isCompletionQuiz === true
				},
				endIndex
			};

		case 'reflection':
			return {
				block: {
					type: 'reflection',
					id: attrs.id || `r${Date.now()}`,
					question: blockContent,
					initialValue: attrs.initialValue
				},
				endIndex
			};

		case 'embed':
			return {
				block: {
					type: 'embed',
					url: attrs.url || '',
					title: attrs.title,
					height: attrs.height ? parseInt(attrs.height) : 600
				},
				endIndex
			};

		default:
			// Unknown directive - treat as text
			return {
				block: {
					type: 'text',
					body: blockContent
				},
				endIndex
			};
	}
}

/**
 * Parse attributes from {key="value" key2=value2} format
 */
function parseAttributes(attrStr: string): Record<string, any> {
	const attrs: Record<string, any> = {};
	const cleanStr = attrStr.slice(1, -1).trim(); // Remove { }

	// Match key="value" or key=value patterns
	const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s}]+))/g;
	let match;

	while ((match = attrRegex.exec(cleanStr)) !== null) {
		const key = match[1];
		const value = match[2] || match[3] || match[4];
		attrs[key] = value;
	}

	return attrs;
}

/**
 * Parse activity content sections
 */
function parseActivityContent(content: string): {
	setup?: string;
	investigation?: string;
	discovery?: string;
} {
	const sections: any = {};

	// Look for **Setup:**, **Investigation:**, **Discovery:** markers
	const setupMatch = content.match(/\*\*Setup:\*\*([\s\S]*?)(?=\*\*Investigation:|\*\*Discovery:|$)/);
	const investigationMatch = content.match(
		/\*\*Investigation:\*\*([\s\S]*?)(?=\*\*Discovery:|$)/
	);
	const discoveryMatch = content.match(/\*\*Discovery:\*\*([\s\S]*)/);

	if (setupMatch) sections.setup = setupMatch[1].trim();
	if (investigationMatch) sections.investigation = investigationMatch[1].trim();
	if (discoveryMatch) sections.discovery = discoveryMatch[1].trim();

	// Fallback: if no sections found, treat entire content as setup
	if (!sections.setup && !sections.investigation && !sections.discovery) {
		sections.setup = content;
	}

	return sections;
}

/**
 * Parse case study content sections
 */
function parseCaseStudyContent(content: string): {
	situation: string;
	diagnosis: string;
	solution: string;
} {
	const situationMatch = content.match(/\*\*Situation:\*\*([\s\S]*?)(?=\*\*Diagnosis:|\*\*Solution:|$)/);
	const diagnosisMatch = content.match(/\*\*Diagnosis:\*\*([\s\S]*?)(?=\*\*Solution:|$)/);
	const solutionMatch = content.match(/\*\*Solution:\*\*([\s\S]*)/);

	return {
		situation: situationMatch ? situationMatch[1].trim() : '',
		diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : '',
		solution: solutionMatch ? solutionMatch[1].trim() : ''
	};
}

/**
 * Parse quiz questions from markdown list format
 */
function parseQuizQuestions(content: string): QuizQuestion[] {
	const questions: QuizQuestion[] = [];

	// Split by question markers (numbered list)
	const questionBlocks = content.split(/\n(?=\d+\.\s)/);

	for (const block of questionBlocks) {
		if (!block.trim()) continue;

		const lines = block.split('\n');
		const questionLine = lines[0].trim();
		const questionMatch = questionLine.match(/^\d+\.\s*(.+)/);

		if (!questionMatch) continue;

		const questionText = questionMatch[1];
		const options: Array<{ id: string; text: string }> = [];
		let correct = '';
		let explanation = '';

		for (let i = 1; i < lines.length; i++) {
			const line = lines[i].trim();

			// Match options: a) text or - a) text
			const optionMatch = line.match(/^-?\s*([a-d])\)\s*(.+)/);
			if (optionMatch) {
				options.push({
					id: optionMatch[1],
					text: optionMatch[2]
				});
				continue;
			}

			// Match correct answer: *Correct: a*
			const correctMatch = line.match(/\*Correct:\s*([a-d])\*/);
			if (correctMatch) {
				correct = correctMatch[1];
				continue;
			}

			// Match explanation: *Explanation: text*
			const explanationMatch = line.match(/\*Explanation:\s*(.+)\*/);
			if (explanationMatch) {
				explanation = explanationMatch[1];
			}
		}

		if (questionText && options.length > 0 && correct) {
			questions.push({
				id: `q${questions.length + 1}`,
				question: questionText,
				options,
				correct,
				explanation: explanation || 'Check the lesson content for more details.'
			});
		}
	}

	return questions;
}
